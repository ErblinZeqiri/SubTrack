from marshmallow import Schema, fields


# # # User Request # # #
class CreateUserRequest(Schema):
  email = fields.String(required=True, validate=lambda x: "@" in x)
  fullName = fields.String(required=True)
  password = fields.String(required=True)


# # # Login Request # # #
class LoginRequest(Schema):
  email = fields.String(required=True, validate=lambda x: "@" in x)
  password = fields.String(required=True)

  
# # # Subscription Request # # #
class CreateSubscriptionRequest(Schema):
  companyName = fields.String(required=True)
  amount = fields.Integer(required=True)
  category = fields.String(required=True)
  renewal = fields.String(required=True)
  nextPaymentDate = fields.String(required=True)
  paymentHistory = fields.Dict()
  deadline = fields.String(required=True)
  domain = fields.String(required=True)
  logo = fields.String(required=True)
