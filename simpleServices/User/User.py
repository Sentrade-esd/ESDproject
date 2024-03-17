from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/esd'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'user'

    UserID = db.Column(db.Integer, primary_key=True)
    Email = db.Column(db.String(255), nullable=False)
    Password = db.Column(db.String(255), nullable=False)
    Telehandle = db.Column(db.String(255))

    def __init__(self, UserID, Email, Password, Telehandle):
        self.UserID = UserID
        self.Email = Email
        self.Password = Password
        self.Telehandle = Telehandle

    def json(self):
        return {"UserID": self.UserID, "Email": self.Email, "Password": self.Password, "Telehandle": self.Telehandle}

@app.route("/user")
def get_all():
    userList = db.session.query(User).all()

    if len(userList):
        return jsonify(
            {
                "code": 200,
                "data": {
                    "User": [usr.json() for usr in userList]
                }
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "There are no Users."
        }
    ), 404

@app.route("/user/<int:UserID>")
def find_by_UserID(UserID):
    user = db.session.query(User).filter_by(UserID=UserID).first()

    if user:
        return jsonify(
            {
                "code": 200,
                "data": user.json()
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "User not found."
        }
    ), 404

@app.route("/user/<int:UserID>", methods=['POST'])
def create_user(UserID):
    if db.session.query(User).filter_by(UserID=UserID).first():
        return jsonify(
            {
                "code": 400,
                "data": {
                    "UserID": UserID
                },
                "message": "User already exists."
            }
        ), 400

    data = request.get_json()

    if 'Password' in data:
        data['Password'] = hashlib.sha1(data['Password'].encode()).hexdigest()
    
    user = User(UserID, data['Email'], data['Password'], data['Telehandle'])

    try:
        db.session.add(user)
        db.session.commit()
    except:
        return jsonify(
            {
                "code": 500,
                "data": {
                    "UserID": UserID
                },
                "message": "An error occurred creating the user."
            }
        ), 500

    return jsonify(
        {
            "code": 201,
            "data": user.json()
        }
    ), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
