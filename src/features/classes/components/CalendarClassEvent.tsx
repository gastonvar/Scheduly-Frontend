import type { SyntheticEvent } from 'react';
import type { EventProps } from 'react-big-calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ClassCalendarEvent } from '@/features/classes/hooks/useCalendarView';
import type { Class, ClassPaymentStatus } from '@/types';
import { CLASS_PAYMENT_STATUS_OPTIONS } from '@/utils/classStatus';
import { formatTimeRange } from '@/utils/format';

type CalendarClassEventProps = EventProps<ClassCalendarEvent> & {
  hideStatus?: boolean;
  onPaymentStatusChange: (classItem: Class, status: ClassPaymentStatus) => void;
  showTimeRange?: boolean;
  timeView?: boolean;
};

function stopCalendarInteraction(event: SyntheticEvent) {
  event.stopPropagation();
}

function SubjectNameBadge({ color, name }: { color: string; name: string }) {
  return (
    <span className="scheduly-calendar-event-subject" style={{ backgroundColor: color }}>
      {name}
    </span>
  );
}

function EventDetails({
  attendeeNames,
  subjectColor,
  subjectName,
  showSubject = true,
}: {
  attendeeNames: string;
  subjectColor: string;
  subjectName: string;
  showSubject?: boolean;
}) {
  if (!showSubject && !attendeeNames) {
    return null;
  }

  return (
    <div className="scheduly-calendar-event-details">
      {showSubject ? <SubjectNameBadge color={subjectColor} name={subjectName} /> : null}
      {attendeeNames ? <span className="scheduly-calendar-event-attendees">{attendeeNames}</span> : null}
    </div>
  );
}

export function CalendarPaymentStatusSelect({
  classItem,
  onPaymentStatusChange,
}: {
  classItem: Class;
  onPaymentStatusChange: (classItem: Class, status: ClassPaymentStatus) => void;
}) {
  return (
    <div
      className="scheduly-calendar-event-paid-row"
      onClick={stopCalendarInteraction}
      onDoubleClick={stopCalendarInteraction}
      onMouseDown={stopCalendarInteraction}
      onPointerDown={stopCalendarInteraction}
    >
      <Select
        items={CLASS_PAYMENT_STATUS_OPTIONS}
        onValueChange={(value) => {
          if (typeof value !== 'string') {
            return;
          }

          onPaymentStatusChange(classItem, value as ClassPaymentStatus);
        }}
        value={classItem.paymentStatus}
      >
        <SelectTrigger
          aria-label="Estado de pago"
          className="scheduly-calendar-payment-select"
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="scheduly-calendar-payment-select-content"
        >
          {CLASS_PAYMENT_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CalendarClassEvent({
  event,
  hideStatus = false,
  onPaymentStatusChange,
  showTimeRange = false,
  timeView = false,
}: CalendarClassEventProps) {
  const classItem = event.resource;
  const timeRange = showTimeRange ? formatTimeRange(event.start, event.end) : null;
  const statusSelect = hideStatus ? null : (
    <CalendarPaymentStatusSelect classItem={classItem} onPaymentStatusChange={onPaymentStatusChange} />
  );

  if (timeView || showTimeRange) {
    return (
      <div className="scheduly-calendar-event-content scheduly-calendar-event-content--time">
        <div className="scheduly-calendar-event-time-status-row">
          {timeRange ? <span className="scheduly-calendar-event-time">{timeRange}</span> : null}
          <SubjectNameBadge color={event.subjectColor} name={event.subjectName} />
          {statusSelect}
        </div>
        <EventDetails
          attendeeNames={event.attendeeNames}
          showSubject={false}
          subjectColor={event.subjectColor}
          subjectName={event.subjectName}
        />
      </div>
    );
  }

  return (
    <div className="scheduly-calendar-event-content">
      <EventDetails
        attendeeNames={event.attendeeNames}
        subjectColor={event.subjectColor}
        subjectName={event.subjectName}
      />
      {statusSelect}
    </div>
  );
}
