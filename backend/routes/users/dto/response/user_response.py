from marshmallow import Schema, fields

class UserResponse(Schema):
  uid = fields.String()
  email = fields.String()
  lastname = fields.String()
  password = fields.String()
  salt = fields.String()

class UserId(Schema):
  uid = fields.String()

class UserResponseWithMessage(Schema):
  message = fields.String()
  data = fields.Nested(UserResponse)