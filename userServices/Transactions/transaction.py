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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


