from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("questions/", views.QuestionListView.as_view(), name="question-list"),
    path("questions/<int:pk>/", views.QuestionDetailView.as_view(), name="question-detail"),
    path("exams/", views.OfficialExamListView.as_view(), name="exam-list"),
    path("exams/<int:pk>/", views.OfficialExamDetailView.as_view(), name="exam-detail"),
    path("factsheets/", views.FactSheetListView.as_view(), name="factsheet-list"),
    path("factsheets/<slug:factsheet_id>/", views.FactSheetDetailView.as_view(), name="factsheet-detail"),
]
