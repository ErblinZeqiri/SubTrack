from firebase_admin.firestore import DocumentReference, DocumentSnapshot

from .models import User, Subscription


# # # User Mapper # # #
class UserMapper:
  def to_user(self, user: dict | DocumentSnapshot | DocumentReference) -> User:
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
  
# # # Subscription Mapper # # #
class SubscriptionMapper:
  def to_subscription(self, subscription: dict | DocumentSnapshot | DocumentReference) -> Subscription:
    subscription_dict = {}
    if isinstance(subscription, DocumentReference):
      subscription_dict.update({"id" : subscription.id})
      subscription = subscription.get().to_dict()      
    elif isinstance(subscription, DocumentSnapshot):
      subscription_dict.update({"id" : subscription.id})
      subscription = subscription.to_dict()

    subscription_dict.update(subscription)

    return Subscription(
      subscription_dict.get("id", ""),
      subscription_dict.get("companyName", ""),
      subscription_dict.get("nextPaymentDate", ""),
      subscription_dict.get("amount", 0),
      subscription_dict.get("category", ""),
      subscription_dict.get("renewal", ""),
      subscription_dict.get("paymentHistory", {}),
      subscription_dict.get("deadline", ""),
      subscription_dict.get("domain", ""),
      subscription_dict.get("logo", ""),
      subscription_dict.get("user_uid", "") 
    )

  def to_dict(self, subscription: Subscription) -> dict:
    return {
      u"id": subscription.id,
      u"companyName": subscription.companyName,
      u"nextPaymentDate": subscription.nextPaymentDate,
      u"amount": subscription.amount,
      u"category": subscription.category,
      u"renewal": subscription.renewal,
      u"paymentHistory": subscription.paymentHistory,
      u"deadline": subscription.deadline,
      u"domain": subscription.domain,
      u"logo": subscription.logo,
      u"user_uid": subscription.user_uid
    }

  def to_firestore_dict(self, subscription: Subscription) -> dict:
    return {
      u"companyName": subscription.companyName,
      u"nextPaymentDate": subscription.nextPaymentDate,
      u"amount": subscription.amount,
      u"category": subscription.category,
      u"renewal": subscription.renewal,
      u"paymentHistory": subscription.paymentHistory,
      u"deadline": subscription.deadline,
      u"domain": subscription.domain,
      u"logo": subscription.logo,
      u"user_uid": subscription.user_uid
    }