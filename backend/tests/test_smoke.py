import pytest


@pytest.mark.django_db
def test_categories_endpoint(client):
    response = client.get("/api/content/categories/")
    assert response.status_code in (200, 401, 403)


@pytest.mark.django_db
def test_exams_endpoint(client):
    response = client.get("/api/content/exams/")
    assert response.status_code in (200, 401, 403)
