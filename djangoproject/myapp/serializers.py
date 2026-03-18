from rest_framework import serializers
from .models import MarineWasteDetection
class MarineWasteDetectionSerializer(serializers.ModelSerializer):
    analysis_timestamp = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", required=False)
    class Meta:
        model = MarineWasteDetection
        fields = '__all__' 