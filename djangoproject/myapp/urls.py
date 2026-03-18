
# from django.urls import path
# from myapp.views import signup_view, detect_marine_waste,custom_login,get_dashboard_data,get_single_detection,get_batch_results,get_locations_by_city,get_spot_insight

# # This is the "Pre-written" login code from the library
# from rest_framework_simplejwt.views import TokenObtainPairView

# urlpatterns = [
#     # SIGNUP: Uses your custom code in views.py
#     path('signup/', signup_view, name='signup'),
    
#     # LOGIN: Uses the library code (No need to write it in views.py!)
#     path('login/', custom_login, name='login'),  
    
#     # DETECTION: Uses your AI code in views.py
#     path('detect/', detect_marine_waste, name='detect'),
#     path('dashboard/', get_dashboard_data, name='dashboard'),
#     path('detection/<int:detection_id>/', get_single_detection, name='single_detection'),
#     path('batch/<uuid:batch_id>/', get_batch_results, name='batch_results'),
#     path('locations/', views.get_locations_by_city, name='locations_by_city'),
#     path('spot-insight/', views.get_spot_insight, name='spot_insight'),

# ]
from django.urls import path
from myapp.views import (
    signup_view, 
    detect_marine_waste, 
    custom_login, 
    get_dashboard_data, 
    get_single_detection, 
    get_batch_results, 
    get_locations_by_city,  # Directly imported
    get_spot_insight        # Directly imported
)

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', custom_login, name='login'),  
    path('detect/', detect_marine_waste, name='detect'),
    path('dashboard/', get_dashboard_data, name='dashboard'),
    path('detection/<int:detection_id>/', get_single_detection, name='single_detection'),
    path('batch/<uuid:batch_id>/', get_batch_results, name='batch_results'),
    
    # Fixed these lines (removed "views.")
    path('locations/', get_locations_by_city, name='locations_by_city'),
    path('spot-insight/', get_spot_insight, name='spot_insight'),
]