from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
# from flask_cors import CORS
import os
import json

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
    # __tablename__ = 'transaction'

    # TransactionID = db.Column(db.Integer, primary_key=True)
    # UserID = db.Column(db.Integer, nullable=False)
    # Email = db.Column(db.String(255), nullable=False)
    # Company = db.Column(db.String(255), nullable=False)
    # DateTimestamp = db.Column(db.DateTime, nullable=False)
    # BuyAmount = db.Column(db.Float(precision=2), nullable=False)
    # SellAmount = db.Column(db.Float(precision=2), nullable=True)
    # StopLossSentimentThreshold = db.Column(db.Float(precision=2), nullable=False)
    # TotalAccountValue = db.Column(db.Float(precision=2), nullable=False)

    # def __init__(self, UserID, Company, DateTimestamp, BuyAmount, SellAmount, StopLossSentimentThreshold, TotalAccountValue):
    #     self.UserID = UserID
    #     self.Company = Company
    #     self.DateTimestamp = DateTimestamp
    #     self.BuyAmount = BuyAmount
    #     self.SellAmount = SellAmount
    #     self.StopLossSentimentThreshold = StopLossSentimentThreshold
    #     self.TotalAccountValue = TotalAccountValue

    # def json(self):
    #     return {"UserID": self.UserID, "Company": self.Company, "DateTimestamp": self.DateTimestamp,
    #             "BuyAmount": self.BuyAmount, "SellAmount": self.SellAmount,
    #             "StopLossSentimentThreshold": self.StopLossSentimentThreshold,
    #             "TotalAccountValue": self.TotalAccountValue}

    __tablename__ = 'transaction'

    TransactionID = db.Column('transactionid', db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column('userid', db.Integer, nullable=False)
    Email = db.Column('email', db.String(255), nullable=False)
    Company = db.Column('company', db.String(255), nullable=True)
    DateTimestamp = db.Column('datetimestamp', db.DateTime, nullable=False)
    BuyAmount = db.Column('buyamount', db.Float(precision=2), nullable=True)
    SellAmount = db.Column('sellamount', db.Float(precision=2), nullable=True)
    StopLossSentimentThreshold = db.Column('stoplosssentimentthreshold', db.Float(precision=2), nullable=True)
    TotalAccountValue = db.Column('totalaccountvalue', db.Float(precision=2), nullable=False)

    def __init__(self, UserID, Email, Company, DateTimestamp, BuyAmount, SellAmount, StopLossSentimentThreshold, TotalAccountValue):
        self.UserID = UserID
        self.Email = Email
        self.Company = Company
        self.DateTimestamp = DateTimestamp
        self.BuyAmount = BuyAmount
        self.SellAmount = SellAmount
        self.StopLossSentimentThreshold = StopLossSentimentThreshold
        self.TotalAccountValue = TotalAccountValue

    def json(self):
        return {"TransactionID": self.TransactionID, "UserID": self.UserID, 
                "Email": self.Email, "Company": self.Company, "DateTimestamp": self.DateTimestamp,
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


# Get all the trasactions of a user
# @app.route("/transaction/<string:email>")
# def find_by_email(Email):
#     transaction = db.session.query(Transaction).filter_by(UserID=Email).first()

#     if transaction:
#         return jsonify(
#             {
#                 "code": 200,
#                 "data": transaction.json()
#             }
#         )
#     return jsonify(
#         {
#             "code": 404,
#             "message": "Email not found."
#         }
#     ), 404

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
            UserID=data["UserID"],
            Email=data["Email"],
            Company=None,
            DateTimestamp=datetime.now(), 
            BuyAmount=None,
            SellAmount=None,
            StopLossSentimentThreshold=None,
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

    # if (data["newUser"]):
    #     new_transaction = Transaction(
    #         UserID=data["UserID"],
    #         Email=data["Email"],
    #         Company=None,
    #         DateTimestamp=datetime.now(), 
    #         BuyAmount=None,
    #         SellAmount=None,
    #         StopLossSentimentThreshold=None,
    #         TotalAccountValue=1000
    #     )
    #     db.session.add(new_transaction)
    #     db.session.commit() 

    #     return jsonify(
    #         {
    #             "code": 200,
    #             "data": new_transaction.json(),
    #             "message": "New user successfully added."
    #         }
    #     )

    # else: 

    UserID = data["UserID"]
    Company = data["Company"]

    transaction = Transaction.query.filter_by(UserID=UserID, Company=Company).first()


    if (transaction):
        transaction.Company = data["Company"]
        transaction.DateTimestamp = datetime.now()
        transaction.SellAmount = data["sellAmount"]
        transaction.TotalAccountValue = get_current_account_value(data["UserID"]) + data["sellAmount"]

    # if (check_if_bought(UserID, Company)):
        # update_transaction = Transaction(
        #         UserID=data["UserID"],
        #         Email=data["Email"],
        #         Company=data["Company"],
        #         # DateTimestamp=data["date"], 
        #         DateTimestamp=datetime.now(),
        #         # BuyAmount=data["buyAmount"], 
        #         SellAmount=data["sellAmount"],
        #         # StopLossSentimentThreshold=data["Threshold"],
        #         TotalAccountValue= get_current_account_value(data["UserID"]) - data["sellAmount"]
        #     )
        
        


        # db.session.add(update_transaction)
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
    

    new_transaction = Transaction(
        UserID=data["UserID"],
        Email=data["Email"],
        Company=data["Company"],
        DateTimestamp=datetime.now(), 
        # DateTimestamp=data["Date"], 
        BuyAmount=data["buyAmount"],
        SellAmount=None,  
        StopLossSentimentThreshold=data["Threshold"],
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






@app.route("/checkBalance", methods=["POST"])
def checkBalance():
    data = request.get_json()
    UserID = data["UserID"]
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
    
    if buy_amt < latest_transaction:
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
    UserID = data['data']['UserID']
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
    # Sell amount, bought amonunt, total account value, company
    # print(sellAmount)

    # Need to get company name sent here so I can do matching
    transaction = db.session.query(Transaction).filter_by(UserID=UserID).order_by(Transaction.DateTimestamp.desc()).first()

    # Update the transaction details in the database
    if transaction:
        # print(data['ticker'])
        print(data['data']['ticker'])
        transaction.Company = data['data']['ticker']
        transaction.BuyAmount = bought_amount
        transaction.SellAmount = sellAmount
        transaction.TotalAccountValue = transaction.TotalAccountValue - max_buy_amount + sellAmount  # Assume the total account value gets updated like this

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

# @app.route("/transaction/trigger", methods=['POST'])
# def automated_selling():

#     body = request.get_json()

#     company = body["search"]
#     threshold = body["size"]
    
#     transactions = db.session.query(Transaction).filter_by(Transaction.StopLossSentimentThreshold >= threshold, Transaction.Comapny==company).order_by(Transaction.DateTimestamp.desc()).all()

#     # Get sell price


#     transaction_list = []
#     for transaction in transactions:
#         transaction_dict = {
#             'TransactionID': transaction.TransactionID,
#             'UserID': transaction.UserID,
#             'Email': transaction.Email,
#             'Company': transaction.Company,
#             'DateTimestamp': transaction.DateTimestamp,
#             'BuyAmount': transaction.BuyAmount,
#             'SellAmount': transaction.SellAmount,
#             'StopLossSentimentThreshold': transaction.StopLossSentimentThreshold,
#             'TotalAccountValue': transaction.TotalAccountValue
#         }
#         transaction_list.append(transaction_dict)

#     return jsonify(transaction_list)





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)


