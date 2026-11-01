
# Create models 
from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Custom User Model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('employee', 'Employee'),
        ('technician', 'Technician'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='employee')

# 2. Asset Model
class Asset(models.Model):
    CATEGORY_CHOICES = (
        ('electronics', 'Electronics'),
        ('furniture', 'Furniture'),
        ('stationary', 'Stationary'),
        ('infrastructure', 'Infrastructure'),
    )
    STATUS_CHOICES = (
        ('active', 'Active (Available)'),
        ('pending_acceptance','Pending Acceptance'),
        ('assigned', 'Assigned'),
        ('maintenance', 'Under Maintenance'),
        ('out_of_order', 'Out of Order'),
        ('retired', 'Retired'),
    )
    
    asset_id = models.CharField(max_length=50, unique=True) 
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    serial_no = models.CharField(max_length=100, unique=True)
    qr_id = models.CharField(max_length=100, unique=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_date = models.DateField()
    useful_life = models.IntegerField(help_text="In Years") 
    vendor_name = models.CharField(max_length=200, blank=True, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assets')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    location = models.CharField(max_length=200, help_text="Floor/Room Number", blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.asset_id})"

# 3. Asset Request Model
    
from django.contrib.auth import get_user_model

User = get_user_model()

class AssetRequest(models.Model):
    URGENCY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    # Database Fields
    employee = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    category = models.CharField(max_length=100)
    specs = models.CharField(max_length=255, blank=True, null=True) # Blank allowed rakha hai in case user specs na bhare
    reason = models.TextField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='low')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True) # Admin panel me date dikhane ke liye

    def __str__(self):
        return f"{self.category} Request - {self.status}"

# 4. Maintenance Ticket Model
class MaintenanceTicket(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    )
    
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=100) 
    description = models.TextField()
    photo = models.ImageField(upload_to='ticket_photos/', blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    technician_comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)