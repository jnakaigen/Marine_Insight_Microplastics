
import uuid
from django.db import models
from django.contrib.auth.models import User

class MarineWasteDetection(models.Model):
    
    # Links each detection to the user who uploaded it
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='detections')
    
    # Batch identifier (all images uploaded together)
    batch_id = models.UUIDField(default=uuid.uuid4, editable=False)
    
    # Metadata about the file
    filename = models.CharField(max_length=255)
    total_detections = models.IntegerField()
    
    # TextField is used because Base64 strings can be very long
    annotated_image_base64 = models.TextField()
    graph_image_base64 = models.TextField(null=True, blank=True)
    
    # JSONField stores the list of dictionaries (type, area, risk, etc.) 
    detection_details = models.JSONField() 
    scientific_report = models.TextField(null=True, blank=True)
    
    # ✅ ML Risk Scoring Fields (ADDED)
    ecological_risk_score = models.FloatField(null=True, blank=True)
    ecological_risk_level = models.CharField(max_length=20, null=True, blank=True)

    hazard_analytics = models.JSONField(null=True, blank=True) # Stores the output of calculate_physical_hazard
    aggregated_hazard_score = models.FloatField(default=0.0)    # H_s value
    # Automatically tracks when the analysis was performed
    created_at = models.DateTimeField(auto_now_add=True)
    sampling_location = models.CharField(max_length=255, null=True, blank=True)
    analysis_timestamp = models.DateTimeField(null=True, blank=True)
    
    beach_name = models.CharField(max_length=255, null=True, blank=True)  #       

    def __str__(self):
        return f"{self.filename} - Detected by {self.user.username}"
