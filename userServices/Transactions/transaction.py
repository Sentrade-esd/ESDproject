from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)   

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/esd'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Transaction(db.Model):
    __tablename__ = 'transaction'

    TransactionID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, nullable=False)
    Email = db.Column(db.String(255), nullable=False)
    Company = db.Column(db.String(255), nullable=False)
    DateTimestamp = db.Column(db.DateTime, nullable=False)
    BuyAmount = db.Column(db.Float(precision=2), nullable=False)
    SellAmount = db.Column(db.Float(precision=2), nullable=True)
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


@app.route("/transaction/<string:email>")
def find_by_email(Email):
    transaction = db.session.query(Transaction).filter_by(UserID=Email).first()

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
            "message": "Email not found."
        }
    ), 404

@app.route("/transaction/checkBalance", methods=["GET"])
def checkBalance():
    data = request.get_json()
    email = data["data"]["email"]
    buy_amt = data["data"]["buyAmt"]

    return get_latest_transaction(email, buy_amt)


def get_latest_transaction(email, buy_amt):
    latest_transaction = db.session.query(Transaction).filter_by(Email=email).order_by(Transaction.DateTimestamp.desc()).first().BuyAmount

    if not latest_transaction:
        return False

    if latest_transaction:
        cur_total_value = latest_transaction.TotalAccountValue
    
    if buy_amt < cur_total_value:
        return True
    
    return False


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


