from django.db.models import Sum, Count
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model, login
from rest_framework.permissions import AllowAny
from .models import User, Asset, AssetRequest, MaintenanceTicket
from .serializers import UserSerializer, AssetSerializer, AssetRequestSerializer, MaintenanceTicketSerializer
from datetime import date, timedelta
import datetime
import qrcode
from io import BytesIO

import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse

from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()
# 1. Asset ViewSet
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        cat = request.query_params.get('category')
        assets = Asset.objects.filter(category=cat)
        serializer = self.get_serializer(assets, many=True)
        return Response(serializer.data)

# 2. Request ViewSet 
class AssetRequestViewSet(viewsets.ModelViewSet):
    queryset = AssetRequest.objects.all()
    serializer_class = AssetRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'employee':
            return AssetRequest.objects.filter(employee=user)
        return AssetRequest.objects.all()

# 3. Ticket ViewSet
class MaintenanceTicketViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceTicket.objects.all()
    serializer_class = MaintenanceTicketSerializer

# 4. Login Logic
class LoginAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def post(self, request):
        login_id = request.data.get('username') 
        password = request.data.get('password')
        
        try:
            user_obj = User.objects.get(email=login_id)
            actual_username = user_obj.username
        except User.DoesNotExist:
            actual_username = login_id

        user = authenticate(username=actual_username, password=password)
        
        if user:
            login(request, user) 
            user_role = getattr(user, 'role', 'employee')
            #user_role = user.role
            if user.is_superuser or user.is_staff:
                user_role = 'admin'

            return Response({
                "status": "success",
                "role": user.role,
                "username": user.username,
                "user_id": user.id
            })
            
        return Response({
            "status": "error", 
            "message": "Invalid Email/Username or Password"
        }, status=status.HTTP_401_UNAUTHORIZED)



    
def home_view(request):
    return render(request, 'homepage.html')
def login_page_view(request):
    return render(request, 'login.html')
def admin_dashboard_view(request):
    return render(request, 'ab-admin.html')

def employee_dashboard_view(request):
    return render(request, 'employee-dash.html')
def inventory_page_view(request):
    return render(request, 'inventory.html') 
def Add_Asset_page_view(request):
    return render(request, 'add-asset.html')
def Ticket_page_view(request):
    return render(request, 'tickets.html')
def Report_page_view(request):
    return render(request, 'report.html')
def Request_page_view(request):
    return render(request, 'requests.html')
def User_management_page_view(request):
    return render(request, 'users.html')   
def Logout_page_view(request):
    return render(request, 'logout.html')
def Emp_requestasset_page_view(request):
    return render(request, 'emprequest-asset.html')
def Emp_request_history_page_view(request):
    return render(request, 'emp-request-history.html')
def Emp_report_issue_page_view(request):
    return render(request, 'emp-report-issue.html')
def Emp_ticket_history_page_view(request):
    return render(request, 'emp-myTicket.html')


# assets/views.py
class  AddUserAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

def post(self, request):
    try:
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')
        access_status = request.data.get('status')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        if role and role.lower() == 'admin':
            user.is_staff = True
            user.is_superuser = True 
        else:
            user.is_staff = False
            user.is_superuser = False

        # 2. FIX: ACCESS CONTROL LOGIC
        if access_status and access_status.lower() == 'disabled':
            user.is_active = False
        else:
            user.is_active = True

        user.save()

        # 3. FIX: ASSET ASSIGNMENT ON CREATION
        asset_id = request.data.get('asset_id')
        if asset_id:
            try:
                asset = Asset.objects.get(id=asset_id, status='active')
                asset.assigned_to = user
                asset.status = 'pending_acceptance'
                asset.save()
            except Asset.DoesNotExist:
                pass

        return Response({"status": "success", "message": "User created successfully!"}, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserListAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all().values('username', 'first_name', 'email', 'role', 'is_active')
        return Response(list(users), status=status.HTTP_200_OK)


import time 

class AddAssetAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            print("ASSET DATA RECEIVED:", request.data)

            name = request.data.get('name')
            category = request.data.get('category', '').lower()
            serial_no = request.data.get('serial_no')
            purchase_price = request.data.get('purchase_price')
            purchase_date = request.data.get('purchase_date')

            if not all([name, category, serial_no, purchase_price, purchase_date]):
                return Response({"status": "error", "message": "Basic details, Serial No, Price, and Date are required!"}, status=status.HTTP_400_BAD_REQUEST)

            # --- AUTO-GENERATIon---
            timestamp = int(time.time())
            asset_id = f"AST-{timestamp}"
            qr_id = request.data.get('qr_id') or f"QR-{timestamp}"
            useful_life = 5 

            asset = Asset.objects.create(
                asset_id=asset_id,
                name=name,
                category=category,
                brand=request.data.get('brand'),
                model=request.data.get('model'),
                serial_no=serial_no,
                qr_id=qr_id,
                purchase_price=purchase_price,
                purchase_date=purchase_date,
                useful_life=useful_life,
                vendor_name=request.data.get('vendor_name'),
                status=request.data.get('status', 'active'),
                location=request.data.get('location')
            )
            
            return Response({"status": "success", "message": "Asset Saved Successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("ASSET SAVE ERROR:", str(e))
            return Response({"status": "error", "message": f"Database Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
class AdminDashboardAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            total_employees = User.objects.filter(role='employee').count()
            total_assets = Asset.objects.count()
            active_maintenance = Asset.objects.filter(status='maintenance').count()
            open_tickets = MaintenanceTicket.objects.filter(status='open').count()
            
            value_data = Asset.objects.aggregate(Sum('purchase_price'))
            total_value = value_data['purchase_price__sum'] or 0
            pending_requests = AssetRequest.objects.filter(status='pending').count()

            category_data = Asset.objects.values('category').annotate(count=Count('id'))
            chart_labels = [item['category'].title() for item in category_data]
            chart_counts = [item['count'] for item in category_data]

            recent_activities = []
        
            latest_assets = Asset.objects.all().order_by('-id')[:3]
            for asset in latest_assets:
                recent_activities.append({
                    "item": asset.name,
                    "action": "New Asset Registered",
                    "time": "Just now",
                    "status": "success" 
                })
                
            latest_tickets = MaintenanceTicket.objects.all().order_by('-created_at')[:2]
            for ticket in latest_tickets:
                recent_activities.append({
                    "item": f"Ticket: {ticket.asset.name}",
                    "action": f"Status: {ticket.status}",
                    "time": "Recent",
                    "status": "warning" if ticket.status == 'open' else "info"
                })

            return Response({
                "status": "success",
                "total_employees": total_employees,
                "total_assets": total_assets,
                "active_maintenance": active_maintenance,
                "open_tickets": open_tickets,
                "pending_requests": pending_requests,
                "total_asset_value": float(total_value),
                "chart_labels": chart_labels,     
                "chart_counts": chart_counts,     
                "recent_activities": recent_activities  
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@method_decorator(csrf_exempt, name='dispatch')
class AdminUpdateTicketAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def post(self, request, ticket_id):
        try:
            ticket = MaintenanceTicket.objects.get(id=ticket_id)
            
            status_update = request.data.get('status')
            comments = request.data.get('comments')
            old_status = ticket.status 

            if status_update:
                ticket.status = status_update
                
                if status_update == 'in_progress' and ticket.asset:
                    ticket.asset.status = 'maintenance'
                    ticket.asset.save()
                elif status_update == 'resolved' and ticket.asset:
                    ticket.asset.status = 'assigned'
                    ticket.asset.save()

            if comments is not None:
                ticket.technician_comments = comments

            ticket.save()

            if status_update != old_status and ticket.reported_by and ticket.reported_by.email:
                subject = f"Update on Your Support Ticket: #{ticket.id}"
                message = (
                    f"Hello {ticket.reported_by.first_name or ticket.reported_by.username},\n\n"
                    f"Your support ticket regarding '{ticket.category}' has been updated.\n\n"
                    f"Current Status: {status_update.replace('_', ' ').upper()}\n"
                    f"Support Comment: {comments}\n\n"
                    f"Please check your Smart Office dashboard for more details.\n\n"
                    f"Regards,\n"
                    f"IT Support Team"
                )
                
                try:
                    send_mail(
                        subject,
                        message,
                        settings.EMAIL_HOST_USER,
                        [ticket.reported_by.email], 
                        fail_silently=False, 
                    )
                except Exception as e:
                    print("Email bhejne mein error aayi:", str(e))
        

            return Response({"status": "success", "message": "Ticket updated & Notification sent!"}, status=status.HTTP_200_OK)

        except MaintenanceTicket.DoesNotExist:
            return Response({"status": "error", "message": "Ticket nahi mili!"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminTicketListAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            tickets = MaintenanceTicket.objects.all().order_by('-created_at')
            data = []
            for t in tickets:
                data.append({
                    "id": t.id,
                    "ticket_id": f"TCK-{t.id:04d}",
                    "priority": t.priority.lower(),
                    "status": t.status.lower(),
                    "category": t.category,
                    "description": t.description,
                    "technician_comments": t.technician_comments or "",
                    "asset_name": t.asset.name if t.asset else "Unknown Asset",
                    "location": t.asset.location if t.asset and t.asset.location else "Office",
                    "reported_by": t.reported_by.first_name if t.reported_by else "Unknown",
                    "time": t.created_at.strftime("%d %b, %I:%M %p")
                })
            return Response({"status": "success", "tickets": data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



class AdminReportAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            today = date.today()
            assets = Asset.objects.all()
            
            dep_data = []
            warranty_data = []
            
            for a in assets:
                cost = float(a.purchase_price)
                life = a.useful_life if a.useful_life else 5 
                
                if a.purchase_date:
                    days_old = (today - a.purchase_date).days
                    years_old = max(0, days_old / 365.25)
                    years_old = min(years_old, life) 
                    
                    acc_dep = (cost / life) * years_old 
                    book_value = max(0, round(cost - acc_dep, 2))
                    p_date_str = a.purchase_date.strftime("%b %d, %Y")
                
                    warranty_expiry = a.purchase_date + timedelta(days=365)
                    days_to_expire = (warranty_expiry - today).days
                    
                    if 0 <= days_to_expire <= 30:
                        warranty_data.append({
                            "name": a.name,
                            "serial_no": a.serial_no,
                            "days_left": days_to_expire
                        })
                else:
                    book_value = cost
                    p_date_str = "N/A"

                dep_data.append({
                    "name": a.name,
                    "cost": cost,
                    "purchase_date": p_date_str,
                    "life": f"{life} Years",
                    "book_value": book_value
                })
            
            return Response({
                "status": "success",
                "depreciation": dep_data,
                "warranty_alerts": warranty_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminPendingRequestsAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        try:
        
            pending_requests = AssetRequest.objects.filter(status__iexact='pending').order_by('-created_at')
            data = []
            
            for req in pending_requests:
                emp_name = req.employee.first_name if req.employee else "Unknown"
                initials = emp_name[0:2].upper() if emp_name != "Unknown" else "UN"
                role = req.employee.role.title() if req.employee else "Staff"

                data.append({
                    "id": req.id,
                    "emp_name": emp_name,
                    "initials": initials,
                    "role": role,
                    "category": req.category,
                    "specs": req.specs or "Standard Model",
                    "reason": req.reason,
                    "urgency": req.urgency.lower(),
                    "date": req.created_at.strftime("%d %b, %Y")
                })
                
            return Response({"status": "success", "requests": data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class EmployeeDashboardAPIView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({"status": "error", "message": "Please login first!"}, status=status.HTTP_401_UNAUTHORIZED)

            emp = request.user
            emp_name = emp.first_name if emp.first_name else emp.username
            initials = emp_name[0:2].upper()
            
            my_assets = Asset.objects.filter(assigned_to=emp)
            asset_count = my_assets.count()
            
            asset_list = []
            for a in my_assets:
                asset_list.append({
                    "id": a.id,
                    "name": a.name,
                    "serial_no": a.serial_no,
                    "status": a.status.title(),
                    "category": a.category
                })

            return Response({
                "status": "success",
                "emp_name": emp_name,
                "initials": initials,
                "email": emp.email,
                "asset_count": asset_count,
                "assets": asset_list
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@method_decorator(csrf_exempt, name='dispatch')
class EmployeeSubmitRequestAPIView(APIView):
    def post(self, request):
        try:
            # Terminal check
            print("EMPLOYEE REQUEST DATA:", request.data)

            if not request.user.is_authenticated:
                return Response({"status": "error", "message": "Please login first!"}, status=status.HTTP_401_UNAUTHORIZED)

            category = request.data.get('category')
            specs = request.data.get('specs', '') 
            reason = request.data.get('reason')
            urgency = request.data.get('urgency', 'low')

            if not category or not reason:
                return Response({"status": "error", "message": "Category aur Reason zaroori hain!"}, status=status.HTTP_400_BAD_REQUEST)

            # Database save logic
            AssetRequest.objects.create(
                employee=request.user,  
                category=category,
                specs=specs, 
                reason=reason,
                urgency=urgency,
                status='pending'
            )

            return Response({"status": "success", "message": "Aapki request admin ko bhej di gayi hai!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            
            print("SAVE KARTE WAQT ERROR AAYA:", str(e)) 
            return Response({"status": "error", "message": f"Database me save nahi hua: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import time
from datetime import date

@method_decorator(csrf_exempt, name='dispatch')
class AdminHandleRequestAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def post(self, request, req_id):
        try:
            action = request.data.get('action') 
            admin_note = request.data.get('admin_note', '')

            asset_req = AssetRequest.objects.get(id=req_id)

            if action == 'approved':
                asset_req.status = 'approved'
                valid_categories = ['electronics', 'furniture', 'stationary', 'infrastructure']
                asset_name = asset_req.specs if asset_req.specs else f"{asset_req.category} Asset"
                asset_cat = asset_req.category.lower()
                if asset_cat not in valid_categories:
                    asset_cat = 'electronics' 
                
                timestamp = int(time.time())

                Asset.objects.create(
                    asset_id=f"AST-REQ-{timestamp}",
                    name=asset_name,
                    category=asset_cat,
                    serial_no=f"SN-{timestamp}",
                    qr_id=f"QR-{timestamp}",
                    purchase_price=0.00,
                    purchase_date=date.today(),
                    useful_life=3,
                    assigned_to=asset_req.employee,
                    status='pending_acceptance',
                    location="Assigned via Request"
                )

            elif action == 'rejected':
                asset_req.status = 'rejected'
            else:
                return Response({"status": "error", "message": "Galat action!"}, status=status.HTTP_400_BAD_REQUEST)

            asset_req.admin_feedback = admin_note
            asset_req.save()

            return Response({"status": "success", "message": f"Request {action} and Asset assigned!"}, status=status.HTTP_200_OK)

        except AssetRequest.DoesNotExist:
            return Response({"status": "error", "message": "Request nahi mili!"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("APPROVAL ERROR:", str(e))
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@method_decorator(csrf_exempt, name='dispatch')
class EmployeeSubmitTicketAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def post(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({"status": "error", "message": "Please login first!"}, status=status.HTTP_401_UNAUTHORIZED)

            asset_id = request.data.get('asset_id')
            category = request.data.get('category')
            description = request.data.get('description')
            priority = request.data.get('priority', 'medium')
            
            photo = request.FILES.get('photo')

            if not asset_id or not category or not description:
                return Response({"status": "error", "message": "Zaroori fields khali hain!"}, status=status.HTTP_400_BAD_REQUEST)

            asset = Asset.objects.get(id=asset_id)

            MaintenanceTicket.objects.create(
                asset=asset,
                reported_by=request.user,
                category=category,
                description=description,
                priority=priority,
                photo=photo,
                status='open'
            )

            return Response({"status": "success", "message": "Aapki maintenance ticket ban gayi hai!"}, status=status.HTTP_201_CREATED)

        except Asset.DoesNotExist:
            return Response({"status": "error", "message": "Galat Asset select kiya gaya hai."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class EmployeeTicketListAPIView(APIView):
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({"status": "error", "message": "Please login first!"}, status=status.HTTP_401_UNAUTHORIZED)

            tickets = MaintenanceTicket.objects.filter(reported_by=request.user).order_by('-created_at')
            data = []
            for t in tickets:
                data.append({
                    "id": t.id,
                    "ticket_id": f"TCK-{t.id:04d}",
                    "category": t.category,
                    "status": t.status.lower(),
                    "priority": t.priority.lower(),
                    "description": t.description,
                    "technician_comments": t.technician_comments or "We have received your ticket. A technician will review and update this soon.",
                    "time": t.created_at.strftime("%d %b, %I:%M %p")
                })
            return Response({"status": "success", "tickets": data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#for making qr code

class AssetQRAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request, asset_id):
        try:
            asset = Asset.objects.get(id=asset_id)
            
            assigned_name = "Not Assigned"
            if asset.assigned_to:
                assigned_name = asset.assigned_to.first_name or asset.assigned_to.username
                
            status_text = asset.status.replace('_', ' ').title()
            
            # Warranty Logic
            warranty_status = "Unknown"
            if asset.purchase_date:
                warranty_end = asset.purchase_date + datetime.timedelta(days=365)
                if datetime.date.today() > warranty_end:
                    warranty_status = f"Expired ({warranty_end})"
                else:
                    warranty_status = f"Active till {warranty_end}"

            qr_text = (
                f"--- ASSET FULL DETAILS ---\n"
                f"ID: {asset.asset_id}\n"
                f"Name: {asset.name}\n"
                f"Serial No: {asset.serial_no}\n"
                f"Category: {asset.category.title()}\n"
                f"Status: {status_text}\n"
                f"User: {assigned_name}\n"
                f"Price: Rs. {asset.purchase_price}\n"
                f"Purchased: {asset.purchase_date}\n"
                f"Warranty: {warranty_status}"
            )
            
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10, 
                border=4
            )
            qr.add_data(qr_text)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            return HttpResponse(buffer.getvalue(), content_type="image/png")
            
        except Asset.DoesNotExist:
            return HttpResponse("Asset Not Found", status=404)
        except Exception as e:
            return HttpResponse(f"Error: {str(e)}", status=500)



class EmployeeAcceptAssetAPIView(APIView):
    def post(self, request, asset_id):
        try:
            # Login check
            if not request.user.is_authenticated:
                return Response({"status": "error", "message": "Please login first!"}, status=status.HTTP_401_UNAUTHORIZED)

            asset = Asset.objects.get(id=asset_id, assigned_to=request.user, status='pending_acceptance')
            
            asset.status = 'assigned'
            asset.save()

            return Response({"status": "success", "message": "Asset Accepted Successfully!"}, status=status.HTTP_200_OK)

        except Asset.DoesNotExist:
            return Response({"status": "error", "message": "Asset not found or already accepted!"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)     



# 1. EXCEL (CSV) EXPORT API
class ExportInventoryCSVAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="smart_office_inventory.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Asset ID', 'Name', 'Category', 'Serial No', 'Status', 'Assigned To', 'Purchase Date', 'Price (Rs)'])
        
        assets = Asset.objects.all().order_by('-id')
        for asset in assets:
            assigned_name = asset.assigned_to.first_name if asset.assigned_to else "In IT Room"
            writer.writerow([
                asset.asset_id, 
                asset.name, 
                asset.category.title(), 
                asset.serial_no, 
                asset.status.replace('_', ' ').title(), 
                assigned_name, 
                asset.purchase_date, 
                asset.purchase_price
            ])
            
        return response

# 2. PDF EXPORT API
class ExportInventoryPDFAPIView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="smart_office_inventory.pdf"'
        
        p = canvas.Canvas(response, pagesize=letter)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(200, 750, "Smart Office - Inventory Report")
        
        p.setFont("Helvetica", 10)
        y = 700
        
        # PDF table header
        p.drawString(50, y, "Asset ID")
        p.drawString(130, y, "Name")
        p.drawString(280, y, "Serial No")
        p.drawString(400, y, "Status")
        p.drawString(480, y, "Assigned To")
        
        p.line(50, y-5, 550, y-5) 
        y -= 20
        
        assets = Asset.objects.all().order_by('-id')
        for asset in assets:
            assigned_name = asset.assigned_to.first_name if asset.assigned_to else "None"
            status_text = asset.status.replace('_', ' ').title()
            
            p.drawString(50, y, str(asset.asset_id))
            p.drawString(130, y, str(asset.name)[:20]) 
            p.drawString(280, y, str(asset.serial_no))
            p.drawString(400, y, status_text)
            p.drawString(480, y, assigned_name)
            
            y -= 20
            # start new pages
            if y < 50:
                p.showPage()
                p.setFont("Helvetica", 10)
                y = 750
                
        p.showPage()
        p.save()
        return response