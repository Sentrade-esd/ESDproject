from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/esd'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Transaction(db.Model):
    __tablename__ = 'transaction'

    UserID = db.Column(db.Integer, primary_key=True)
    Company = db.Column(db.String(255), nullable=False)
    DateTimestamp = db.Column(db.DateTime, nullable=False)
    BuyAmount = db.Column(db.Float(precision=2), nullable=False)
    SellAmount = db.Column(db.Float(precision=2), nullable=False)
    StopLossSentimentThreshold = db.Column(db.Float(precision=2), nullable=False)
    TotalAccountValue = db.Column(db.Float(precision=2), nullable=False)

    def __init__(self, UserID, Company, DateTimestamp, BuyAmount, SellAmount, StopLossSentimentThreshold, TotalAccountValue):
        self.UserID = UserID
        self.Company = Company
        self.DateTimestamp = DateTimestamp
        self.BuyAmount = BuyAmount
        self.SellAmount = SellAmount
        self.StopLossSentimentThreshold = StopLossSentimentThreshold
        self.TotalAccountValue = TotalAccountValue

    def json(self):
        return {"UserID": self.UserID, "Company": self.Company, "DateTimestamp": self.DateTimestamp,
                "BuyAmount": self.BuyAmount, "SellAmount": self.SellAmount,
                "StopLossSentimentThreshold": self.StopLossSentimentThreshold,
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


@app.route("/transaction/<int:UserID>")
def find_by_UserID(UserID):
    transaction = db.session.query(Transaction).filter_by(UserID=UserID).first()

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
            "message": "Transaction not found."
        }
    ), 404


@app.route("/transaction/<int:UserID>", methods=['POST'])
def create_transaction(UserID):
    if (db.session.scalars(
        db.select(Transaction).filter_by(UserID=UserID).
        limit(1)
        ).first()
        ):
        return jsonify(
            {
                "code": 400,
                "data": {
                    "UserID": UserID
                },
                "message": "Transaction already exists."
            }
        ), 400

    data = request.get_json()
    # transaction = Transaction(UserID)
    transaction = Transaction(UserID, data['Company'], data['DateTimestamp'], data['BuyAmount'], data['SellAmount'], data['StopLossSentimentThreshold'], data['TotalAccountValue'])

    try:
        db.session.add(transaction)
        db.session.commit()
    except:
        return jsonify(
            {
                "code": 500,
                "data": {
                    "UserID": UserID
                },
                "message": "An error occurred creating the transaction."
            }
        ), 500

    return jsonify(
        {
            "code": 201,
            "data": transaction.json()
        }
    ), 201


@app.route("/followTradeTransaction", methods=['POST'])
def follow_trade_transaction():
    ## ============================ below is for hardcode: ============================

    data = request.get_json()
    email = data['data']['email']
    print('HAHAHAHAHAHAHA STARTING NOW')
    print(email)

    # if transaction: 
    #     transaction.Company = data['data']['Company']
    #     transaction.DateTimestamp = current_timestamp
    #     transaction.BuyAmount = buy_amount
    #     transaction.StopLossSentimentThreshold = 0.0

    # print(data['data']['filings'])
    no_of_filings = len(data['data']['filings'])
    print(no_of_filings)


    max_buy_amount = data['data']['maxBuyAmount']
    # buy_amount_per_filing = buy_amount / no_of_filings
    buy_amount_per_filing = data['data']['buyAmountPerFiling']
    amount_left = max_buy_amount
    total_percentage_of_stock = 0.0

    for i in range(no_of_filings):
        if (amount_left < buy_amount_per_filing):
            buy_amount_per_filing = amount_left
        percentage_of_stock_on_filing = buy_amount_per_filing / float(data['data']['filings'][i]['file_price'])
        amount_left -= buy_amount_per_filing
        total_percentage_of_stock += percentage_of_stock_on_filing
    
    print(total_percentage_of_stock)
    sellAmount = float(data['data']['currentPrice']) * (total_percentage_of_stock)
    profit_loss = sellAmount + amount_left - max_buy_amount
    bought_amount = max_buy_amount - amount_left
    # print(sellAmount)
    return {"PnL":"{:.2f}".format(profit_loss), "fractionalSharesBought":"{:.2f}".format(total_percentage_of_stock), "boughtAmount":"{:.2f}".format(bought_amount), "sellAmount":"{:.2f}".format(sellAmount)}




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)


