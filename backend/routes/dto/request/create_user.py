from marshmallow import Schema, fields

class CreateUserRequest(Schema):
  email = fields.String(required=True, validate=lambda x: "@" in x)
  fullName = fields.String(required=True)
  password = fields.String(required=True)

