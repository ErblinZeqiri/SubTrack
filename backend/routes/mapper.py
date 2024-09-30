from firebase_admin.firestore import DocumentReference, DocumentSnapshot

from .models import User

class UserMapper:
  def to_user(self, user: dict | DocumentSnapshot) -> User:
    user_dict = {}
    if isinstance(user, DocumentReference):
      user_dict.update({"uid" : user.id})
      user = user.get().to_dict()      
    elif isinstance(user, DocumentSnapshot):
      user_dict.update({"uid" : user.id})
      user = user.to_dict()

    user_dict.update(user)

    return User(
      user_dict.get("uid", ""),
      user_dict.get("email", ""),
      user_dict.get("fullName", ""),
      user_dict.get("password", ""),
      user_dict.get("salt", "")
    )
  
  def to_dict(self, user: User) -> dict:
    return {
      u"uid": user.uid,
      u"email": user.email,
      u"fullName": user.fullName,
      u"password": user.password,
      u"salt": user.salt
    }

  def to_firestore_dict(self, user: User) -> dict:
    return {
      u"uid": user.uid,
      u"email": user.email,
      u"fullName": user.fullName,
      u"password": user.password,
      u"salt": user.salt
    }