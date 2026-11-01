

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, AssetRequestViewSet, MaintenanceTicketViewSet, home_view, login_page_view, admin_dashboard_view, employee_dashboard_view, inventory_page_view,  Add_Asset_page_view, Ticket_page_view, Report_page_view, Request_page_view,  User_management_page_view,  Logout_page_view, Emp_requestasset_page_view,  Emp_request_history_page_view, Emp_report_issue_page_view,  Emp_ticket_history_page_view  # home_view import karein
from .views import AddAssetAPIView,  LoginAPIView, AddUserAPIView, UserListAPIView,AdminDashboardAPIView,AdminTicketListAPIView,AdminReportAPIView,AdminPendingRequestsAPIView
from .views import EmployeeDashboardAPIView,EmployeeSubmitRequestAPIView,AdminHandleRequestAPIView,EmployeeSubmitTicketAPIView, AdminUpdateTicketAPIView,EmployeeTicketListAPIView
from .views import AssetQRAPIView,EmployeeAcceptAssetAPIView,ExportInventoryCSVAPIView, ExportInventoryPDFAPIView

router = DefaultRouter()
router.register(r'inventory', AssetViewSet)
router.register(r'requests', AssetRequestViewSet)
router.register(r'tickets', MaintenanceTicketViewSet)

urlpatterns = [
    path('', home_view, name='homepage'), 
    path('login/', login_page_view, name='login'),
    path('ab-admin/', admin_dashboard_view, name='ab-admin'),
    path('employee-dash/', employee_dashboard_view, name='employee-dash'),
    path('inventory/', inventory_page_view, name='inventory'),
    path('add-asset/', Add_Asset_page_view, name='add-asset'),
    path('tickets/', Ticket_page_view, name='tickets'),
    path('report/', Report_page_view, name='report'),
    path('requests/', Request_page_view, name='requests'),
    path('users/', User_management_page_view, name='users'),
    path('logout/', Logout_page_view, name='logout'),
    path('api/add-user/', AddUserAPIView.as_view(), name='api_add_user'),
    path('emprequest-asset/', Emp_requestasset_page_view, name='emprequest-asset'),
    path('emp-request-history/', Emp_request_history_page_view, name='emp-request-history'),
    path('emp-report-issue/', Emp_report_issue_page_view, name='emp-report-issue'),
    path('emp-myTicket/', Emp_ticket_history_page_view, name='emp-myTicket'),
    path('api/users/', UserListAPIView.as_view(), name='api_user_list'),
    path('api/add-asset-custom/', AddAssetAPIView.as_view(), name='api_add_asset_custom'),
    path('api/admin-tickets/', AdminTicketListAPIView.as_view(), name='api_admin_tickets'),
    path('api/reports/', AdminReportAPIView.as_view(), name='api_reports'),
    path('api/admin-pending-requests/', AdminPendingRequestsAPIView.as_view(), name='api_admin_pending_requests'),
    path('api/emp-dashboard/', EmployeeDashboardAPIView.as_view(), name='api_emp_dashboard'),
    path('api/emp-submit-request/', EmployeeSubmitRequestAPIView.as_view(), name='api_emp_submit_request'),
    path('api/admin-update-ticket/<int:ticket_id>/', AdminUpdateTicketAPIView.as_view(), name='api_admin_update_ticket'),
    path('api/admin-handle-request/<int:req_id>/', AdminHandleRequestAPIView.as_view(), name='api_admin_handle_request'),
    path('api/emp-submit-ticket/', EmployeeSubmitTicketAPIView.as_view(), name='api_emp_submit_ticket'),
    path('api/emp-tickets/', EmployeeTicketListAPIView.as_view(), name='api_emp_tickets'),

    path('api/asset-qr/<int:asset_id>/', AssetQRAPIView.as_view(), name='api_asset_qr'),
    path('api/', include(router.urls)),
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/admin-dashboard-stats/', AdminDashboardAPIView.as_view(), name='api_admin_dashboard_stats'),
    path('api/emp-accept-asset/<int:asset_id>/', EmployeeAcceptAssetAPIView.as_view(), name='api_emp_accept_asset'),
    path('api/export/inventory/csv/', ExportInventoryCSVAPIView.as_view(), name='export_inventory_csv'),
    path('api/export/inventory/pdf/', ExportInventoryPDFAPIView.as_view(), name='export_inventory_pdf'),
]

