from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
# from flask_cors import CORS
import os
import json
import requests

app = Flask(__name__)
PORT = os.environ.get('PORT', 5004)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/esd'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['SQL_URI'] + '/transaction_data' if 'SQL_URI' in os.environ else 'mysql+mysqlconnector://root@localhost:3306/esd'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(app.config['SQLALCHEMY_DATABASE_URI'])

db = SQLAlchemy(app)
# CORS(app)

class Transaction(db.Model):
    __tablename__ = 'transaction'

    TransactionID = db.Column('transactionid', db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column('userid', db.Integer, nullable=False)
    Email = db.Column('email', db.String(255), nullable=False)
    Company = db.Column('company', db.String(255), nullable=True)
    DateTimestamp = db.Column('datetimestamp', db.DateTime, nullable=False)
    BuyAmount = db.Column('buyamount', db.Float(precision=2), nullable=True)
    SellAmount = db.Column('sellamount', db.Float(precision=2), nullable=True)
    StopLossSentimentThreshold = db.Column('stoplosssentimentthreshold', db.Float(precision=2), nullable=True)
    StocksHeld = db.Column('stocksheld', db.Float(precision=2), nullable=True)
    TotalAccountValue = db.Column('totalaccountvalue', db.Float(precision=2), nullable=False)

    def __init__(self, UserID, Email, Company, DateTimestamp, BuyAmount, SellAmount, StopLossSentimentThreshold, StocksHeld, TotalAccountValue):
        self.UserID = UserID
        self.Email = Email
        self.Company = Company
        self.DateTimestamp = DateTimestamp
        self.BuyAmount = BuyAmount
        self.SellAmount = SellAmount
        self.StopLossSentimentThreshold = StopLossSentimentThreshold
        self.StocksHeld = StocksHeld
        self.TotalAccountValue = TotalAccountValue

    def json(self):
        return {"TransactionID": self.TransactionID, "UserID": self.UserID, 
                "Email": self.Email, "Company": self.Company, "DateTimestamp": self.DateTimestamp,
                "BuyAmount": self.BuyAmount, "SellAmount": self.SellAmount,
                "StopLossSentimentThreshold": self.StopLossSentimentThreshold, "StocksHeld": self.StocksHeld,
                "TotalAccountValue": self.TotalAccountValue}

@app.route("/transaction")
def get_all():
    transactionList = db.session.scalars(db.select(Transaction)).all()

    if len(transactionList):
        return jsonify(
            {
                "code": 200,
                "data": {
                    "Transaction": [transc.json() for transc in transactionList]
                }
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "There are no Transaction."
        }
    ), 404

# Get the latest transaction for a user
@app.route("/transaction/<int:UserID>")
def find_by_id(UserID):
    # transaction = db.session.query(Transaction).filter_by(UserID=UserID).first()
    transaction = db.session.query(Transaction).filter_by(UserID=UserID).order_by(Transaction.DateTimestamp.desc()).first()

    if transaction:
        return jsonify(
            {
                "code": 200,
                "data": transaction.json()
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "ID not found."
        }
    ), 404

@app.route("/transaction/total/<int:UserID>")
def find_all_by_id(UserID):
    transactionUser = db.session.query(Transaction).filter_by(UserID=UserID).all()

    if transactionUser:
        return jsonify(
            {
                "code": 200,
                "data": {
                    "Transaction": [transc.json() for transc in transactionUser]
                }
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "ID not found."
        }
    ), 404

# When a user sign up, this will be called to setup the inital account value
@app.route("/transaction/setup", methods=["POST"])
def setup_new_user():
    data = request.get_json()

    new_transaction = Transaction(
            UserID=data["userID"],
            Email=data["email"],
            Company=None,
            DateTimestamp=datetime.now(), 
            BuyAmount=None,
            SellAmount=None,
            StopLossSentimentThreshold=None,
            StocksHeld=None,
            TotalAccountValue=1000
        )
    db.session.add(new_transaction)
    db.session.commit() 

    return jsonify(
        {
            "code": 200,
            "data": new_transaction.json(),
            "message": "New user successfully added."
        }
    )


@app.route("/transaction/updateTrade", methods=["POST"])
def add_new_transaction():
    data = request.get_json() 

    UserID = data["UserID"]
    Company = data["Company"]
    # Ticker = data["Ticker"]
    # sellAmount = get_current_price(Ticker)
    sellAmount = data["currentPrice"]
    TransactionID = data["TransactionID"]
    

    transaction = Transaction.query.filter_by(UserID=UserID, Company=Company, TransactionID=TransactionID).first()

    if (transaction):
        if (transaction.StocksHeld):
            transaction.Company = data["Company"]
            transaction.DateTimestamp = datetime.now()
            transaction.SellAmount = sellAmount * Transaction.StocksHeld
            transaction.StocksHeld = 0
            transaction.TotalAccountValue = get_current_account_value(data["UserID"]) + Transaction.SellAmount

            db.session.commit() 

            return jsonify(
            {
                "code": 200,
                "data": transaction.json(),
                "message": "Transaction Updated."
            }
        )
        else:
            return jsonify(
            {
                "code": 400,
                "message": "Trying to sell more stocks than held.",
            }
        )          



    else:
            return jsonify(
        {
            "code": 400,
            "message": "Bad Request: Transaction doesn't exist.",
        }
    )  




# Check if that user is trying to sell stock he doesn't have
def check_if_bought(UserID, Company):
    transaction = Transaction.query.filter_by(UserID=UserID, Company=Company).first()
    return transaction is not None





@app.route("/transaction/newTrade", methods=["POST"])
def update_transaction():
    data = request.get_json()
    # ticker = data["Ticker"] 
    cur_price = data["currentPrice"]
    stocks_bought = data["buyAmount"] / cur_price


    new_transaction = Transaction(
        UserID=data["UserID"],
        Email=data["Email"],
        Company=data["Company"],
        DateTimestamp=datetime.now(), 
        # DateTimestamp=data["Date"], 
        BuyAmount=data["buyAmount"],
        SellAmount=None,  
        StopLossSentimentThreshold=data["Threshold"],
        StocksHeld = stocks_bought,
        TotalAccountValue = get_current_account_value(data["UserID"]) - data["buyAmount"]
    )

    # Adding the new transaction to the session and committing it to save it in the database.
    db.session.add(new_transaction)
    db.session.commit() 

    return jsonify(
            {
                "code": 200,
                "data": new_transaction.json(),
                "message": "New transaction successfully added."
            }
        )






@app.route("/transaction/checkBalance", methods=["POST"])
def checkBalance():
    data = request.get_json()
    UserID = data["userId"]
    print(UserID, type(UserID))
    buy_amt = data["maxBuyAmount"]
    print(type(buy_amt))

    return get_latest_transaction(UserID, buy_amt)


def get_latest_transaction(UserID, buy_amt):
    latest_transaction = db.session.query(Transaction).filter_by(UserID=UserID).order_by(Transaction.DateTimestamp.desc()).first().TotalAccountValue
    print(type(latest_transaction))
    if not latest_transaction:
        return json.dumps(False)

    # if latest_transaction:
    #     cur_total_value = latest_transaction.TotalAccountValue
    
    if float(buy_amt) < float(latest_transaction):
        return json.dumps(True)
    
    return json.dumps(False)

def get_current_account_value(UserID):
    current_value = db.session.query(Transaction).filter_by(UserID=UserID).order_by(Transaction.DateTimestamp.desc()).first().TotalAccountValue
    return current_value



@app.route("/followTradeTransaction", methods=['POST'])
def follow_trade_transaction():
    ## ============================ below is for hardcode: ============================

    data = request.get_json()
    print("DATA IS HERE:", data)
    UserID = data['data']['userId']
    print('HAHAHAHAHAHAHA STARTING NOW')
    print(UserID)

    # if transaction:  # THIS IS THE ONE I NEED TO UPDATE
    #     transaction.Company = data['data']['Company']
    #     transaction.DateTimestamp = current_timestamp
    #     transaction.BuyAmount = buy_amount
    #     transaction.StopLossSentimentThreshold = 0.0

    # print(data['data']['filings'])
    no_of_filings = len(data['data']['filings'])
    print(no_of_filings)


    max_buy_amount = float(data['data']['maxBuyAmount'])
    # buy_amount_per_filing = buy_amount / no_of_filings
    buy_amount_per_filing = float(data['data']['buyAmountPerFiling'])
    amount_left = max_buy_amount
    total_percentage_of_stock = 0.0

    for i in range(no_of_filings):
        if (amount_left < buy_amount_per_filing):
            buy_amount_per_filing = amount_left
        percentage_of_stock_on_filing = float(buy_amount_per_filing) / float(data['data']['filings'][i]['file_price'])
        amount_left -= float(buy_amount_per_filing)
        total_percentage_of_stock += percentage_of_stock_on_filing
    
    print(total_percentage_of_stock)
    sellAmount = float(data['data']['currentPrice']) * (total_percentage_of_stock)
    profit_loss = sellAmount + amount_left - max_buy_amount
    bought_amount = max_buy_amount - amount_left 
    # Sell amount, bought amonunt, total account value, company
    # print(sellAmount)



    # transaction = db.session.query(Transaction).filter_by(UserID=UserID).order_by(Transaction.DateTimestamp.desc()).first()
    
    company=data["data"]["company"]
    email = data["data"]["email"]
    
    last_transaction = db.session.query(Transaction).filter_by(UserID=UserID).order_by(Transaction.DateTimestamp.desc()).first()

    # If there was a last transaction, use its 'TotalAccountValue'
    if last_transaction is not None:
        total_account_value = last_transaction.TotalAccountValue + profit_loss
    else:
        # handle case where there is no last transaction
        total_account_value = 1000 + profit_loss  # Add 1000 since setup also gives 1000

    transaction = Transaction(UserID=UserID, Email=email, Company=company, BuyAmount=bought_amount, DateTimestamp=datetime.now(),
                        SellAmount=sellAmount, StopLossSentimentThreshold=0, StocksHeld=0, TotalAccountValue=total_account_value)


    # Need to send both company name and ticker
    ticker = data["data"]["ticker"]

    # Update the transaction details in the database
    # if transaction:
    #     # print(data['ticker'])
    #     print(data['data']['ticker'])
    #     transaction.Company = company
    #     transaction.BuyAmount = bought_amount
    #     transaction.SellAmount = sellAmount
    #     transaction.StocksHeld = total_percentage_of_stock
    #     transaction.TotalAccountValue = transaction.TotalAccountValue - max_buy_amount + sellAmount  # Assume the total account value gets updated like this

        # db.session.commit()
    
    db.session.add(transaction)
    db.session.commit()

    # return jsonify(
    #     {
    #         "code": 200,
    #         "data": {
    #             "Company": transaction.Company,
    #             "buyAmount": transaction.BuyAmount,
    #             "sellAmount": transaction.SellAmount,
    #             "totalAccountValue": transaction.TotalAccountValue
    #         }
    #     }
    # )


    return jsonify(
        {
            "code": 200,
            "data": {
                "Company": transaction.Company,
                "buyAmount": transaction.BuyAmount,
                "sellAmount": transaction.SellAmount,
                "totalAccountValue": transaction.TotalAccountValue
            }
        }
    ), {"PnL":"{:.2f}".format(profit_loss), "fractionalSharesBought":"{:.2f}".format(total_percentage_of_stock), "boughtAmount":"{:.2f}".format(bought_amount), "sellAmount":"{:.2f}".format(sellAmount)}

# def check_open_transactions(Company, Size):
#     transaction = db.session.query(Transaction).filter_by(Transaction.Company==Company, Transaction.StopLossSentimentThreshold >=Size).all()
#     return transaction

@app.route("/transaction/trigger", methods=['POST'])
def automated_selling():
    print ("Automated Selling")
    body = request.get_json()

    company = body["search"]
    threshold = float(body["size"])
    currentPrice = body["currentPrice"]
    
    # Checking where stoploss is met, is for that company, and that the transaction is open
    transactions = db.session.query(Transaction).filter(Transaction.StopLossSentimentThreshold <= threshold, Transaction.Company==company, Transaction.SellAmount.is_(None)).all()


    print(transactions)
    

    transaction_list = []
    for transaction in transactions:
        sellAmount = float(transaction.StocksHeld) * float(currentPrice)
        transaction_dict = {
            'TransactionID': transaction.TransactionID,
            'UserID': transaction.UserID,
            'Email': transaction.Email,
            'Company': transaction.Company,
            'DateTimestamp': transaction.DateTimestamp,
            'BuyAmount': transaction.BuyAmount,
            'SellAmount': sellAmount,
            'StopLossSentimentThreshold': transaction.StopLossSentimentThreshold,
            'TotalAccountValue': transaction.TotalAccountValue + sellAmount
        }
        transaction.SellAmount = sellAmount
        transaction.TotalAccountValue = transaction.TotalAccountValue + sellAmount
        db.session.merge(transaction)

        transaction_list.append(transaction_dict)

    db.session.commit()  # commit the changes to the database

    print(transaction_list)

    # if len(transaction_list) == 0: return 404
    if len(transaction_list) == 0:
        return jsonify(
            {
                "code": 404,
                "message": "No transactions to sell."
            }
        ), 404
    else:
        return jsonify(
            {
                "code": 200,
                "data": transaction_list,
                "message": "Transactions successfully sold."
            }
        )


# def get_current_price(ticker):
#     url = f"http://localhost:3000/scraper/scrapeCurrentPrice/{ticker}"
#     price = requests.get(url).text
#     price_float = float(price)
#     return price_float



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)


