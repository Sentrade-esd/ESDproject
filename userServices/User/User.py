from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import hashlib
import os

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r'/*': {'origins': '*'}})   ###### consider changing to accept from kong 

# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/esd'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['SQL_URI'] + '/user_data' if 'SQL_URI' in os.environ else 'mysql+mysqlconnector://root@localhost:3306/esd'
print(app.config['SQLALCHEMY_DATABASE_URI'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(app.config['SQLALCHEMY_DATABASE_URI'])

db = SQLAlchemy(app)
print("Database connected successfully")

class User(db.Model):


    __tablename__ = 'user'

    UserID = db.Column('userid', db.Integer, primary_key=True, autoincrement=True)
    Email = db.Column('email', db.String(255), nullable=False)
    Password = db.Column('password', db.String(255), nullable=False)
    Telehandle = db.Column('telehandle', db.String(255))
    TeleID = db.Column('teleid', db.Integer, nullable=True)
    CreationDate = db.Column('creationdate', db.String(255), nullable=False)

    def __init__(self, Email, Password, Telehandle, TeleID, CreationDate):
        self.Email = Email
        self.Password = Password
        self.Telehandle = Telehandle
        self.TeleID = TeleID
        self.CreationDate = CreationDate

    def json(self):
        return {"UserID": self.UserID, "Email": self.Email, "Password": self.Password, "Telehandle": self.Telehandle, "TeleID": self.TeleID, "CreationDate": self.CreationDate}

@app.route("/user", methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
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

    if request.method == 'POST':
        data = request.get_json()

        # if 'Password' in data:
        #     data['Password'] = hashlib.sha1(data['Password'].encode()).hexdigest()

        new_user = User(data['Email'], data['Password'], data.get('Telehandle', None), data.get('TeleID', None), data['CreationDate'])

        try:
            db.session.add(new_user)
            db.session.commit()
        except:
            return jsonify(
                {
                    "code": 500,
                    "message": "An error occurred creating the user."
                }
            ), 500

        return jsonify(
            {
                "code": 201,
                "data": new_user.json()
            }
        ), 201


@app.route("/user/getUser")
def find_by_email():
    email = request.args.get('email')
    user = db.session.query(User).filter_by(Email=email).first()

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)