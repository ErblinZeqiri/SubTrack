from marshmallow import Schema, fields

from .response import UserResponse

class UserResponseList(Schema):
  users = fields.List(fields.Nested(UserResponse))