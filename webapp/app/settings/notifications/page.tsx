import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage how you receive updates about your applications
        </p>
      </div>

      <div className="space-y-6">
        {/* Coming Soon Notice */}
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Notification Settings Coming Soon
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            We're working on adding email notifications, browser notifications,
            and daily digest features. Stay tuned!
          </p>
        </div>

        {/* Planned Features Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Planned Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Email notifications for status changes
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Daily digest of application updates
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Browser push notifications
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Customizable notification preferences
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
