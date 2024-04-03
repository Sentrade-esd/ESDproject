""" Scrape the stock transactions from Senator periodic filings. """
from flask import Flask, request, jsonify
from datetime import datetime
from collections import defaultdict
import datetime as dt
from functools import lru_cache
import json
import os


from bs4 import BeautifulSoup

import logging
import pandas as pd
import pickle
import requests
import time
from typing import Any, List, Optional

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import yfinance as yf



app = Flask(__name__)

# @app.route('/your_endpoint', methods=['POST'])
# def handle_post():
#     data = request.get_json()  # get the request data in JSON format
#     # process the data
#     print(data)
#     return jsonify({'message': 'POST request received'}), 200

ROOT = 'https://efdsearch.senate.gov'
LANDING_PAGE_URL = '{}/search/home/'.format(ROOT)
SEARCH_PAGE_URL = '{}/search/'.format(ROOT)
REPORTS_URL = '{}/search/report/data/'.format(ROOT)

BATCH_SIZE = 200
RATE_LIMIT_SECS = 0.1

PDF_PREFIX = '/search/view/paper/'
LANDING_PAGE_FAIL = 'Failed to fetch filings landing page'

REPORT_COL_NAMES = [
    'tx_date',
    'file_date',
    'last_name',
    'first_name',
    'order_type',
    'ticker',
    'asset_name',
    'tx_amount'
]

LOGGER = logging.getLogger(__name__)


def add_rate_limit(f):
    def with_rate_limit(*args, **kw):
        time.sleep(RATE_LIMIT_SECS)
        return f(*args, **kw)
    return with_rate_limit


def _csrf(client: requests.Session) -> str:
    """ Set the session ID and return the CSRF token for this session. """
    landing_page_response = client.get(LANDING_PAGE_URL)
    assert landing_page_response.url == LANDING_PAGE_URL, LANDING_PAGE_FAIL

    landing_page = BeautifulSoup(landing_page_response.text, 'lxml')
    form_csrf = landing_page.find(
        attrs={'name': 'csrfmiddlewaretoken'}
    )['value']
    form_payload = {
        'csrfmiddlewaretoken': form_csrf,
        'prohibition_agreement': '1'
    }
    client.post(LANDING_PAGE_URL,
                data=form_payload,
                headers={'Referer': LANDING_PAGE_URL})

    if 'csrftoken' in client.cookies:
        csrftoken = client.cookies['csrftoken']
    else:
        csrftoken = client.cookies['csrf']
    return csrftoken


def senator_reports(targetDate, client: requests.Session) -> List[List[str]]:
    """ Return all results from the periodic transaction reports API. """
    token = _csrf(client)
    idx = 0
    reports = reports_api(client, idx, token, targetDate)
    all_reports: List[List[str]] = []
    while len(reports) != 0:
        all_reports.extend(reports)
        idx += BATCH_SIZE
        reports = reports_api(client, idx, token, targetDate)
    return all_reports


def reports_api(
    client: requests.Session,
    offset: int,
    token: str, 
    targetDate,
) -> List[List[str]]:
    """ Query the periodic transaction reports API. """

    # format the targetDate
    formatted_targetDate = datetime.strptime(targetDate, '%Y-%m-%d').strftime('%m/%d/%Y %H:%M:%S')

    login_data = {
        'start': str(offset),
        'length': str(BATCH_SIZE),
        'report_types': '[11]',
        'filer_types': '[]',
        'submitted_start_date': formatted_targetDate,
        'submitted_end_date': '',
        'candidate_state': '',
        'senator_state': '',
        'office_id': '',
        'first_name': '',
        'last_name': '',
        'csrfmiddlewaretoken': token
    }
    LOGGER.info('Getting rows starting at {}'.format(offset))
    response = client.post(REPORTS_URL,
                           data=login_data,
                           headers={'Referer': SEARCH_PAGE_URL})
    return response.json()['data']


def _tbody_from_link(client: requests.Session, link: str) -> Optional[Any]:
    """
    Return the tbody element containing transactions for this senator.
    Return None if no such tbody element exists.
    """
    report_url = '{0}{1}'.format(ROOT, link)
    report_response = client.get(report_url)
    # If the page is redirected, then the session ID has expired
    if report_response.url == LANDING_PAGE_URL:
        LOGGER.info('Resetting CSRF token and session cookie')
        _csrf(client)
        report_response = client.get(report_url)
    report = BeautifulSoup(report_response.text, 'lxml')
    tbodies = report.find_all('tbody')
    if len(tbodies) == 0:
        return None
    return tbodies[0]


def txs_for_report(client: requests.Session, row: List[str]) -> pd.DataFrame:
    """
    Convert a row from the periodic transaction reports API to a DataFrame
    of transactions.
    """
    first, last, _, link_html, date_received = row
    link = BeautifulSoup(link_html, 'lxml').a.get('href')
    # We cannot parse PDFs
    if link[:len(PDF_PREFIX)] == PDF_PREFIX:
        return pd.DataFrame()

    tbody = _tbody_from_link(client, link)
    if not tbody:
        return pd.DataFrame()

    stocks = []
    for table_row in tbody.find_all('tr'):
        cols = [c.get_text() for c in table_row.find_all('td')]
        tx_date, ticker, asset_name, asset_type, order_type, tx_amount =\
            cols[1], cols[3], cols[4], cols[5], cols[6], cols[7]
        if asset_type != 'Stock' and ticker.strip() in ('--', ''):
            continue
        stocks.append([
            tx_date,
            date_received,
            last,
            first,
            order_type,
            ticker,
            asset_name,
            tx_amount
        ])
    return pd.DataFrame(stocks).rename(
        columns=dict(enumerate(REPORT_COL_NAMES)))


def main(targetDate) -> pd.DataFrame:
    LOGGER.info('Initializing client')
    client = requests.Session()
    client.get = add_rate_limit(client.get)
    client.post = add_rate_limit(client.post)
    reports = senator_reports(targetDate, client)
    all_txs = pd.DataFrame()
    for i, row in enumerate(reports):
        if i % 10 == 0:
            LOGGER.info('Fetching report #{}'.format(i))
            LOGGER.info('{} transactions total'.format(len(all_txs)))
        txs = txs_for_report(client, row)
        # all_txs = all_txs.append(txs)
        all_txs = pd.concat([all_txs, txs])
    return all_txs

# ============================== Parsing and Cleaning Dataset ===============
    
def tokenize(asset_name):
    """ Convert an asset name into useful tokens. """
    token_string = asset_name\
        .replace('(', '')\
        .replace(')', '')\
        .replace('-', ' ')\
        .replace('.', '')
    return token_string.split(' ')

def token_is_ticker(token, token_blacklist):
    return len(token) <= 4 and token.upper() not in token_blacklist

def parse_tx_amount(amt):
    """ Get the lower bound for the transaction amount. """
    return int(amt.replace('Over $50,000,000', '50000000')
               .split(' - ')[0]
               .replace(',', '')
               .replace('$', ''))
 
def clean_data(raw_senators_tx):
    # These generic words do not help us determine the ticker
    with open('blacklist.json', 'r') as f:
        blacklist = set(json.load(f))

    missing_tickers = set(raw_senators_tx[
        (raw_senators_tx['ticker'] == '--')
        | (raw_senators_tx['ticker'] == '')
    ]['asset_name'])

    ticker_map = {}
    unmapped_tickers = set()
    for m in missing_tickers:
        tokens = tokenize(m)
        if token_is_ticker(tokens[0], blacklist):
            ticker_map[m] = tokens[0].upper()
        elif token_is_ticker(tokens[-1], blacklist):
            ticker_map[m] = tokens[-1].upper()
        else:
            unmapped_tickers.add(m)

    phrase_to_ticker = {
    'FOX': 'FOX',
    'AMAZON': 'AMZN',
    'AARON': 'AAN',
    'ALTRIA': 'MO',
    'APPLE': 'AAPL',
    'CHEVRON': 'CVX',
    'DUPONT': 'DD',
    'ALPHABET': 'GOOGL',
    'GOOG': 'GOOGL',
    'GENERAL ELECTRIC': 'GE',
    'JOHNSON': 'JNJ',
    'NEWELL': 'NWL',
    'OWENS': 'OMI',
    'PFIZER': 'PFE',
    'TYSON': 'TSN',
    'UNDER ARMOUR': 'UAA',
    'VERIZON': 'VZ',
    'WALT': 'DIS'
    }

    for m in unmapped_tickers:
        for t in phrase_to_ticker:
            if t in m.upper():
                ticker_map[m] = phrase_to_ticker[t]

    tx_with_tickers = raw_senators_tx.copy()
    for a, t in ticker_map.items():
        tx_with_tickers.loc[tx_with_tickers['asset_name'] == a, 'ticker'] = t

    filtered_tx = tx_with_tickers[tx_with_tickers['ticker'] != '--']
    filtered_tx = filtered_tx.assign(
        ticker=filtered_tx['ticker'].map(
            lambda s: s.replace('--', '').replace('\n', '')))

    filtered_tx = filtered_tx[filtered_tx['order_type'] != 'Exchange']

    senators_tx = filtered_tx.assign(
        tx_estimate=filtered_tx['tx_amount'].map(parse_tx_amount))
    senators_tx = senators_tx.assign(
        full_name=senators_tx['first_name']
            .str
            .cat(senators_tx['last_name'], sep=' ')
    )
    useful_cols = [
        'file_date',
        'tx_date',
        'full_name',
        'order_type',
        'ticker',
        'tx_estimate'
    ]
    senators_tx = senators_tx[useful_cols]
    senators_tx = senators_tx.assign(
        tx_date=senators_tx['tx_date'].map(
            lambda v: dt.datetime.strptime(v.strip(), '%m/%d/%Y')))
    senators_tx = senators_tx.assign(
        file_date=senators_tx['file_date'].map(
            lambda v: dt.datetime.strptime(v.strip(), '%m/%d/%Y')))
    senators_tx
    print('============= RETURNING =============')

    #return output
    return senators_tx



@app.route('/senatorFilings/getFilings/<ticker>/<targetDate>', methods=['GET'])
def handle_get(ticker, targetDate):
    # process the request
    print(f'ticker: {ticker}, targetDate: {targetDate}')
    # execute the get senator trades;
    raw_senators_tx = main(targetDate)


    output_senator_trade = clean_data(raw_senators_tx)

    filtered_senator_trade = output_senator_trade[output_senator_trade['ticker'] == ticker]

    # convert the DataFrame to a JSON string
    json_str = filtered_senator_trade.to_json(orient='records')

    # return the JSON string
    return jsonify({'data': json_str}), 200

PORT = os.environ.get('PORT', 5000)

if __name__ == '__main__':
    host = '0.0.0.0'
    log_format = '[%(asctime)s %(levelname)s] %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_format)
    print(f'Running Flask app on http://{host}:{PORT}')
    app.run(host=host, port=PORT,debug=True)



