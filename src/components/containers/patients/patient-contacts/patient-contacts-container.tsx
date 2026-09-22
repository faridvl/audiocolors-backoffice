import React, { useState } from 'react';
import { Phone, Plus, Trash2, Loader2, AlertTriangle, Users, X } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { PatientContact } from '@/types/patients/patient-contact';
import { usePatientContacts } from './use-patient-contacts';
import { ConfirmDeleteContactModal } from './confirm-delete-contact-modal';

interface ContactRowProps {
  contact: PatientContact;
  onDelete: () => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, onDelete }) => (
  <div className="flex items-center justify-between gap-3 rounded-card border border-ink-200 bg-white px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
        <Phone className="h-4 w-4 text-brand-600" aria-hidden />
      </span>
      <div className="min-w-0">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
          {contact.name}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>{contact.phone}</Typography>
      </div>
    </div>

    <button
      type="button"
      onClick={onDelete}
      aria-label={`Eliminar teléfono de ${contact.name}`}
      className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-danger/10 hover:text-danger"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  </div>
);

interface ManageContactsModalProps {
  patientUuid: string;
  onClose: () => void;
}

const ManageContactsModal: React.FC<ManageContactsModalProps> = ({ patientUuid, onClose }) => {
  const {
    contacts,
    isLoading,
    isError,
    refetch,
    isAdding,
    handleStartAdding,
    handleCancelAdding,
    name,
    setName,
    phone,
    handlePhoneChange,
    canSubmit,
    handleAddContact,
    isCreating,
    contactToDelete,
    setContactToDelete,
    handleConfirmDelete,
    isDeleting,
  } = usePatientContacts(patientUuid);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <Typography variant={TypographyVariant.SUBTITLE}>
            Teléfonos adicionales{' '}
            {contacts.length > 0 && <span className="text-ink-400">({contacts.length})</span>}
          </Typography>

          <div className="flex shrink-0 items-center gap-2">
            {!isAdding && (
              <button
                type="button"
                onClick={handleStartAdding}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Agregar contacto
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="flex flex-col gap-3 rounded-card border border-ink-200 bg-ink-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor="contact-name">
                  <Typography variant={TypographyVariant.HELPER}>Nombre</Typography>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  autoFocus
                  className={inputBaseClasses}
                />
                <Typography variant={TypographyVariant.HELPER} className="text-ink-400">
                  Incluí el parentesco, por ejemplo: Juan (hijo)
                </Typography>
              </div>

              <div className="flex flex-col gap-1 sm:w-40 sm:shrink-0">
                <label htmlFor="contact-phone">
                  <Typography variant={TypographyVariant.HELPER}>Teléfono</Typography>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  maxLength={20}
                  className={inputBaseClasses}
                />
                <Typography variant={TypographyVariant.HELPER} className="text-ink-400">
                  Formato: 8888-8888
                </Typography>
              </div>
            </div>

            <div className="flex gap-2 sm:justify-end">
              <Button variant={ButtonVariant.SECONDARY} onClick={handleCancelAdding}>
                Cancelar
              </Button>
              <Button
                variant={ButtonVariant.PRIMARY}
                onClick={handleAddContact}
                disabled={!canSubmit}
                isLoading={isCreating}
                icon={<Plus className="h-4 w-4" aria-hidden />}
              >
                Agregar
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 rounded-card border border-ink-200 bg-white py-10">
            <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
            <Typography variant={TypographyVariant.BODY}>Cargando teléfonos...</Typography>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-2 rounded-card border border-ink-200 bg-white py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
            <Typography variant={TypographyVariant.ACCENT}>
              No se pudieron cargar los teléfonos
            </Typography>
            <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && !isError && contacts.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-ink-300 bg-white py-10 text-center">
            <Users className="h-8 w-8 text-ink-300" aria-hidden />
            <Typography variant={TypographyVariant.ACCENT}>Sin teléfonos adicionales</Typography>
            <Typography variant={TypographyVariant.BODY}>
              Agrega contactos como el de un familiar o acompañante.
            </Typography>
          </div>
        )}

        {!isLoading && !isError && contacts.length > 0 && (
          <div className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.uuid}
                contact={contact}
                onDelete={() => setContactToDelete(contact)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteContactModal
        contactName={contactToDelete?.name ?? null}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setContactToDelete(null)}
      />
    </div>
  );
};

interface PatientContactsContainerProps {
  patientUuid: string;
}

/**
 * Un link abre el modal de gestion de telefonos adicionales. La lista no vive
 * en pantalla: es informacion secundaria que se consulta poco, similar en
 * peso a "Ver todos los datos" del resumen del paciente.
 */
export const PatientContactsContainer: React.FC<PatientContactsContainerProps> = ({
  patientUuid,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
      >
        <Phone className="h-3.5 w-3.5" aria-hidden />
        Gestionar teléfonos adicionales
      </button>

      {isOpen && (
        <ManageContactsModal patientUuid={patientUuid} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};
