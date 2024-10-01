import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from firebase_admin.firestore import DocumentSnapshot

from config.firestore_db import db

from .models import User, Subscription
from .mapper import UserMapper, SubscriptionMapper
from flask import g


class UserRepository:
  def __init__(self) -> None:
    self.collection = db.collection(u"users")
    self.mapper = UserMapper()

  def get_all(self) -> list[User]:
    users = []
    for user in self.collection.get():
      user_data = user.to_dict()
      user_obj = self.mapper.to_user(user_data)
      users.append(self.mapper.to_dict(user_obj))
    print("Users:", users)
    return users
  
  def get_one(self, user_uid: str) -> User:
    user = self.collection.document(user_uid).get()

    if not user.exists:
      raise ValueError(f"user with uid {user_uid} doesn't exists")
    
    return self.mapper.to_user(user)
  
  def create_user(self, user: User) -> User:
    _, user_ref = self.collection.add(self.mapper.to_firestore_dict(user))
    user_snapshot = user_ref.get()
    user_dict = self.mapper.to_dict(user)
    user_dict['uid'] = user_snapshot.id
    user_ref.update(user_dict)
    print("User Dict:", user_dict)
    return self.mapper.to_user(user_dict)

  def get_user_by_email(self, email: str) -> list[User]:
    return [self.mapper.to_user(d) for d in self.collection.where("email", "==", email).get()]
  

# # # Subscriptions # # #
class SubscriptionRepository:
  def __init__(self) -> None:
    self.collection = db.collection(u"subscriptions")
    self.mapper = SubscriptionMapper()

  def get_all(self) -> list[Subscription]:
    subscriptions = []
    for subscription in self.collection.get():
      subscription_data = subscription.to_dict()
      subscription_obj = self.mapper.to_subscription(subscription_data)
      subscriptions.append(self.mapper.to_dict(subscription_obj))
    print("Subscriptions:", subscriptions)
    return subscriptions

  def get_one(self, subscription_id: str) -> Subscription:
    subscription = self.collection.document(subscription_id).get()

    if not subscription.exists:
      raise ValueError(f"subscription with uid {subscription_id} doesn't exists")
    
    return self.mapper.to_subscription(subscription)
  
  def create_subscription(self, subscription: Subscription) -> Subscription:
    _, subscription_ref = self.collection.add(self.mapper.to_firestore_dict(subscription))
    subscription_ref = subscription_ref.get()
    subscription_dict = self.mapper.to_dict(subscription)
    subscription_dict['userId'] = g.user_id
    subscription_ref.update(subscription_dict)
    print("Subscription Dict:", subscription_dict)
    return self.mapper.to_subscription(subscription_dict)

  def update_subscription(self, subscription: Subscription) -> Subscription:
    self.collection.document(subscription.uid).set(self.mapper.to_firestore_dict(subscription))
    return subscription