from rest_framework import serializers
from .models import User, Asset, AssetRequest, MaintenanceTicket

# 1. User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            # Agar first name hai toh wo bhejo, warna username
            return obj.assigned_to.first_name or obj.assigned_to.username
        return None

# 2. Asset Serializer
class AssetSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = Asset
        fields = '__all__'

# 3. Asset Request Serializer
class AssetRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.username')

    class Meta:
        model = AssetRequest
        fields = '__all__'

# 4. Maintenance Ticket Serializer
class MaintenanceTicketSerializer(serializers.ModelSerializer):
    asset_name = serializers.ReadOnlyField(source='asset.name')
    reported_by_name = serializers.ReadOnlyField(source='reported_by.username')

    class Meta:
        model = MaintenanceTicket
        fields = '__all__'