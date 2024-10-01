from marshmallow import Schema, fields


# # # User Response # # #
class UserResponse(Schema):
  uid = fields.String()
  email = fields.String()
  fullName = fields.String()
  password = fields.String()
  salt = fields.String()

class UserId(Schema):
  uid = fields.String()

# # # Subscription Response # # #
class SubscriptionResponse(Schema):
  companyName = fields.String()
  amount = fields.Integer()
  category = fields.String()
  renewal = fields.String()
  nextPaymentDate = fields.Date()
  paymentHistory = fields.Dict()
  deadline = fields.Date()
  domain = fields.String()
  logo = fields.String()
  user_uid  = fields.String()

class LoginResponse(Schema):
  token = fields.String()