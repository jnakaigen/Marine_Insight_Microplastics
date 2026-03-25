#Because your frontend reads data in JSON format, but your Django database (db.sqlite3) stores data in complex Python objects, you need a bridge. That is exactly what this MarineWasteDetectionSerializer does: it converts your database records into clean JSON (and vice versa).

from rest_framework import serializers
from .models import MarineWasteDetection
class MarineWasteDetectionSerializer(serializers.ModelSerializer):
    analysis_timestamp = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", required=False)
    class Meta:
        model = MarineWasteDetection
        fields = '__all__' 