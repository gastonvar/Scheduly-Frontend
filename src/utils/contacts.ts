import type { Contact, ContactType } from '@/types';

export const CONTACT_TYPES: ContactType[] = ['Email', 'Phone', 'WhatsApp', 'Discord'];

const contactLabels: Record<ContactType, string> = {
  Email: 'Email',
  Phone: 'Teléfono',
  WhatsApp: 'WhatsApp',
  Discord: 'Discord',
};

export function contactTypeLabel(type: ContactType): string {
  return contactLabels[type];
}

export function formatContact(contact: Contact): string {
  return `${contactTypeLabel(contact.type)}: ${contact.value}`;
}

export function formatContacts(contacts: Contact[]): string {
  return contacts.filter((contact) => contact.value.trim()).map(formatContact).join(' · ');
}

export function createEmptyContact(type: ContactType = 'Email'): Contact {
  return { id: crypto.randomUUID(), type, value: '' };
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function contactHref(contact: Contact): string | null {
  const value = contact.value.trim();
  if (!value) return null;

  if (contact.type === 'Email') {
    return `mailto:${value}`;
  }

  if (contact.type === 'Phone') {
    const digits = digitsOnly(value);
    return digits ? `tel:${digits}` : null;
  }

  if (contact.type === 'WhatsApp') {
    const digits = digitsOnly(value);
    return digits ? `https://wa.me/${digits}` : null;
  }

  return null;
}

export async function copyContactValue(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
