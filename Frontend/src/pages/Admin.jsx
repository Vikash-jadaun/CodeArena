import { Plus, Edit, Trash2, Video } from 'lucide-react';
import { NavLink } from 'react-router';
import AppHeader from '../components/AppHeader';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'video Problem',
      description: 'Upload and delete video',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    }
  ];

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="page-container">
        {/* Header */}
        <div className="page-heading">
          <div><p className="eyebrow">Workspace settings</p><h1>
            Admin Panel
          </h1>
          <p>
            Manage coding problems on your platform
          </p></div>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="panel"
              >
                <div className="card-body items-center text-center p-5">
                  {/* Icon */}
                  <div className={`${option.bgColor} p-4 rounded-full mb-4`}>
                    <IconComponent size={32} className="text-base-content" />
                  </div>

                  {/* Title */}
                  <h2 className="card-title text-xl mb-2">
                    {option.title}
                  </h2>

                  {/* Description */}
                  <p className="text-base-content/70 mb-6">
                    {option.description}
                  </p>

                  {/* Action Button */}
                  <div className="card-actions">
                    <div className="card-actions">
                    <NavLink
                    to={option.route}
                   className="primary-button"
                   >
                   {option.title}
                   </NavLink>
                   </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Admin;
