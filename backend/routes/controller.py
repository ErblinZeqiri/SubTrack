from flask.views import MethodView
from flask_smorest import Blueprint

from .models import User

from .dto.request.create_user import CreateUserRequest
from .dto.response.user_response import UserResponse, UserId, UserResponseWithMessage
from .dto.response.user_response_list import UserResponseList

from .service import UserService
from .mapper import UserMapper


# # # Users # # #
users = Blueprint("users", "users", url_prefix="/users", description="Users routes")
user_service = UserService()
user_mapper = UserMapper()

@users.route("/")
class UserController(MethodView):
  @users.doc(description="Retrieve a list of all the users of the system")
  @users.response(status_code=200, schema=UserResponseList(many=True), description="Return the list of all the users user")
  def get(self):
    return user_service.get_all()

  @users.arguments(CreateUserRequest)
  @users.response(status_code=201, schema=UserResponse)
  @users.response(status_code=422)
  def post(self, user: dict):
    try:
      return user_service.create_user(user_mapper.to_user(user))
    except ValueError as e:
      return {"message": str(e)}, 422
  
@users.route("/<uid>")
class SpecificUserController(MethodView):
  @users.doc(description="Retrieve a specific user given the uid")
  @users.response(status_code=200, schema=UserResponse, description="Return the specific user")
  def get(self, uid):
    u = User("qwertz", "Antonio", "Pisanello", "moiap13", "1234567890", "jlkshg")
    u_dict = u.to_dict()
    return u_dict

  def put(self, uid):
    return f"hello put users with uid {uid}"
  
  def delete(self, uid):
    return f"hello delete users with uid {uid}"
  
@users.route("/message", methods=["POST"])
@users.arguments(CreateUserRequest)
@users.response(status_code=201, schema=UserResponseWithMessage)
def create_user_w_msg(user):
  res = {
    "message": "User Created",
    "data": user
  }

  return res