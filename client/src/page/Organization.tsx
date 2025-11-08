import { useState } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Plus,
  ArrowLeft,
  Building,
  Award,
  Activity,
  Clock,
  Download,
  Eye,
  Edit,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  documentsCount: number;
  verificationScore: number;
  joinDate: string;
}

interface Document {
  id: string;
  employeeName: string;
  documentName: string;
  type: string;
  status: 'verified' | 'pending' | 'expired' | 'rejected';
  uploadDate: string;
  department: string;
}

const Organization = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const employees: Employee[] = [
    { id: '1', name: 'John Doe', email: 'john@company.com', department: 'Engineering', role: 'Senior Developer', status: 'active', documentsCount: 5, verificationScore: 98, joinDate: '2024-01-15' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah@company.com', department: 'Marketing', role: 'Marketing Manager', status: 'active', documentsCount: 4, verificationScore: 95, joinDate: '2024-02-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales', role: 'Sales Representative', status: 'pending', documentsCount: 2, verificationScore: 75, joinDate: '2025-01-10' },
    { id: '4', name: 'Emily Brown', email: 'emily@company.com', department: 'HR', role: 'HR Specialist', status: 'active', documentsCount: 6, verificationScore: 100, joinDate: '2023-11-05' },
  ];

  const documents: Document[] = [
    { id: '1', employeeName: 'John Doe', documentName: 'Employment Contract', type: 'Contract', status: 'verified', uploadDate: '2025-01-15', department: 'Engineering' },
    { id: '2', employeeName: 'Sarah Wilson', documentName: 'ID Verification', type: 'Identity', status: 'verified', uploadDate: '2025-01-14', department: 'Marketing' },
    { id: '3', employeeName: 'Mike Johnson', documentName: 'Background Check', type: 'Security', status: 'pending', uploadDate: '2025-01-20', department: 'Sales' },
    { id: '4', employeeName: 'Emily Brown', documentName: 'Medical Certificate', type: 'Medical', status: 'expired', uploadDate: '2024-12-01', department: 'HR' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'expired':
      case 'rejected':
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'expired':
      case 'rejected':
      case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orgStats = [
    { label: 'Total Employees', value: '247', icon: Users, color: 'blue', change: '+12%' },
    { label: 'Documents Verified', value: '1,284', icon: CheckCircle, color: 'green', change: '+8%' },
    { label: 'Pending Reviews', value: '23', icon: Clock, color: 'orange', change: '-5%' },
    { label: 'Compliance Score', value: '96%', icon: Award, color: 'purple', change: '+2%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative px-6 py-6 backdrop-blur-sm bg-white/80 border-b border-gray-200/50 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                VeriFile
              </span>
              <span className="text-xs text-orange-600 font-medium -mt-1">
                Organization Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">TechCorp</span> Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage employees, documents, and maintain organizational compliance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {orgStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'orange' ? 'bg-orange-100' : 'bg-purple-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'orange' ? 'text-orange-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <span>Recent Activity</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {documents.slice(0, 4).map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                          <div className={`p-2 rounded-lg ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{doc.documentName}</div>
                            <div className="text-sm text-gray-500">{doc.employeeName} • {doc.department}</div>
                          </div>
                          <div className="text-xs text-gray-400">{doc.uploadDate}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Department Overview */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Building className="w-5 h-5 text-purple-500" />
                      <span>Departments</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {['Engineering', 'Marketing', 'Sales', 'HR'].map((dept) => {
                        const employeeCount = employees.filter(emp => emp.department === dept).length;
                        const avgScore = Math.round(
                          employees
                            .filter(emp => emp.department === dept)
                            .reduce((acc, emp) => acc + emp.verificationScore, 0) / employeeCount
                        );
                        
                        return (
                          <div key={dept} className="flex items-center justify-between p-3 bg-white rounded-xl">
                            <div>
                              <div className="font-medium text-gray-900">{dept}</div>
                              <div className="text-sm text-gray-500">{employeeCount} employees</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{avgScore}%</div>
                              <div className="text-xs text-gray-500">Compliance</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('employees')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
                  >
                    <Users className="w-8 h-8 mb-3" />
                    <div className="font-semibold mb-1">Manage Employees</div>
                    <div className="text-sm opacity-90">Add, edit, or review employee profiles</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('documents')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
                  >
                    <FileText className="w-8 h-8 mb-3" />
                    <div className="font-semibold mb-1">Review Documents</div>
                    <div className="text-sm opacity-90">Verify and approve employee documents</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
                  >
                    <BarChart3 className="w-8 h-8 mb-3" />
                    <div className="font-semibold mb-1">View Analytics</div>
                    <div className="text-sm opacity-90">Analyze compliance and performance metrics</div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'employees' && (
              <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 hover:border-orange-300 text-gray-700 hover:text-orange-600 rounded-xl transition-all">
                      <Filter className="w-5 h-5" />
                      <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl">
                      <Plus className="w-5 h-5" />
                      <span>Add Employee</span>
                    </button>
                  </div>
                </div>

                {/* Employees List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Employee</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Department</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Documents</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Compliance</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{employee.name}</div>
                                  <div className="text-sm text-gray-500">{employee.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">{employee.department}</div>
                              <div className="text-sm text-gray-500">{employee.role}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                {getStatusIcon(employee.status)}
                                <span className="capitalize">{employee.status}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">{employee.documentsCount}</div>
                              <div className="text-sm text-gray-500">documents</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      employee.verificationScore >= 95 ? 'bg-green-500' :
                                      employee.verificationScore >= 80 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${employee.verificationScore}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{employee.verificationScore}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-1">
                                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                            <FileText className="w-6 h-6 text-gray-600" />
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900">{doc.documentName}</div>
                            <div className="text-sm text-gray-500">
                              {doc.employeeName} • {doc.department} • {doc.type}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)}
                            <span className="capitalize">{doc.status}</span>
                          </div>
                          
                          <div className="text-sm text-gray-500">{doc.uploadDate}</div>
                          
                          <div className="flex space-x-1">
                            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Compliance Trends */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span>Compliance Trends</span>
                    </h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <div>Compliance chart would go here</div>
                      </div>
                    </div>
                  </div>

                  {/* Department Performance */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-purple-500" />
                      <span>Department Performance</span>
                    </h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <div>Department chart would go here</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-2xl font-bold text-green-600 mb-2">96.5%</div>
                    <div className="text-gray-600">Average Compliance Score</div>
                    <div className="text-sm text-green-600 mt-1">↑ 2.3% from last month</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-2xl font-bold text-orange-600 mb-2">4.2 days</div>
                    <div className="text-gray-600">Average Review Time</div>
                    <div className="text-sm text-red-600 mt-1">↓ 0.8 days from last month</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600 mb-2">98.1%</div>
                    <div className="text-gray-600">Document Accuracy</div>
                    <div className="text-sm text-green-600 mt-1">↑ 1.2% from last month</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Organization