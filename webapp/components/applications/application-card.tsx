'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Calendar, Trash2, MoreVertical } from 'lucide-react';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  currentStatus: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  deadlineDate: string | null;
  salaryRange: string | null;
  notes: string | null;
}

interface ApplicationCardProps {
  application: Application;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

const statusColors: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-800',
  applied: 'bg-blue-100 text-blue-800',
  assessment: 'bg-purple-100 text-purple-800',
  interview: 'bg-yellow-100 text-yellow-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-green-600 text-white',
  rejected: 'bg-red-100 text-red-800',
};

const statuses = ['saved', 'applied', 'assessment', 'interview', 'offer', 'accepted', 'rejected'];

export function ApplicationCard({ application, onDelete, onStatusChange }: ApplicationCardProps) {

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusVariant = {
    saved: 'secondary',
    applied: 'default',
    assessment: 'outline',
    interview: 'outline',
    offer: 'default',
    accepted: 'default',
    rejected: 'destructive',
  }[application.currentStatus] as 'default' | 'secondary' | 'outline' | 'destructive';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/applications/${application.id}`}
            className="flex-1 min-w-0 hover:opacity-80"
          >
            <h3 className="text-lg font-semibold truncate">
              {application.jobTitle}
            </h3>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {application.companyName}
            </p>
            {application.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{application.location}</span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant={statusVariant}>
              {application.currentStatus.charAt(0).toUpperCase() + application.currentStatus.slice(1)}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(application.id, status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(application.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="capitalize">
            {application.source.replace('_', ' ')}
          </Badge>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(application.updatedAt)}</span>
          </div>
          {application.salaryRange && (
            <>
              <span>•</span>
              <span>{application.salaryRange}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
