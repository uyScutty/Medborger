from django.urls import path

from . import views

urlpatterns = [
    path("attempts/", views.AttemptListView.as_view(), name="attempt-list"),
    path("attempts/start/", views.StartAttemptView.as_view(), name="attempt-start"),
    path("attempts/<int:attempt_id>/answer/", views.SubmitAnswerView.as_view(), name="attempt-answer"),
    path("attempts/<int:attempt_id>/complete/", views.CompleteAttemptView.as_view(), name="attempt-complete"),
    path("attempts/<int:pk>/", views.AttemptDetailView.as_view(), name="attempt-detail"),
    path("progress/", views.ProgressView.as_view(), name="progress"),
]
