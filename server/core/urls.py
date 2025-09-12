from django.urls import path
from . import auth_views, users_views, files_views, public_views
from .auth_views import csrf


urlpatterns = [
    # auth
    path('auth/register', auth_views.register),
    path('auth/login', auth_views.login_view),
    path('auth/logout', auth_views.logout_view),
    path('auth/me', auth_views.me),

    # users (admin)
    path('users', users_views.list_users),
    path('users/<int:user_id>', users_views.delete_user),
    path('users/<int:user_id>/toggle-admin', users_views.toggle_admin),

    # files
    path('files', files_views.list_files),           # GET
    path('files/upload', files_views.upload_file),   # POST
    path('files/<int:file_id>', files_views.update_file),  # PATCH
    path('files/<int:file_id>/delete', files_views.delete_file),  # DELETE
    path('files/<int:file_id>/download', files_views.download_file),
    path('files/<int:file_id>/publish', files_views.publish_file),

    # public
    path('public/<str:token>', public_views.public_download),

    # csrf token
    path("csrf/", csrf, name="csrf"),
]
