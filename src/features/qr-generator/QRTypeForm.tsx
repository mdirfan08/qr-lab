import type { QRFields } from "../../types/qr";
import type { ValidationErrors } from "../../lib/validation";
import { FieldWrap, TextField, TextAreaField } from "../../components/ui/Field";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { Toggle } from "../../components/ui/Toggle";

interface QRTypeFormProps {
  fields: QRFields;
  errors: ValidationErrors;
  onChange: (fields: QRFields) => void;
}

export function QRTypeForm({ fields, errors, onChange }: QRTypeFormProps) {
  switch (fields.type) {
    case "url":
      return (
        <FieldWrap label="Destination URL" error={errors.url}>
          <TextField
            placeholder="https://yourproject.com"
            value={fields.url}
            onChange={(e) => onChange({ ...fields, url: e.target.value })}
            error={errors.url}
          />
        </FieldWrap>
      );

    case "text":
      return (
        <FieldWrap label="Text content" error={errors.text}>
          <TextAreaField
            rows={5}
            placeholder="Anything you want encoded — a note, a message, a code."
            value={fields.text}
            onChange={(e) => onChange({ ...fields, text: e.target.value })}
            error={errors.text}
          />
        </FieldWrap>
      );

    case "email":
      return (
        <div className="space-y-4">
          <FieldWrap label="Recipient email" error={errors.to}>
            <TextField
              placeholder="hello@yourproject.com"
              value={fields.to}
              onChange={(e) => onChange({ ...fields, to: e.target.value })}
              error={errors.to}
            />
          </FieldWrap>
          <FieldWrap label="Subject (optional)">
            <TextField
              placeholder="Let's talk"
              value={fields.subject}
              onChange={(e) => onChange({ ...fields, subject: e.target.value })}
            />
          </FieldWrap>
          <FieldWrap label="Message (optional)">
            <TextAreaField
              rows={3}
              placeholder="Pre-filled message body"
              value={fields.body}
              onChange={(e) => onChange({ ...fields, body: e.target.value })}
            />
          </FieldWrap>
        </div>
      );

    case "phone":
      return (
        <FieldWrap label="Phone number" error={errors.phone}>
          <TextField
            placeholder="+1 555 010 2020"
            value={fields.phone}
            onChange={(e) => onChange({ ...fields, phone: e.target.value })}
            error={errors.phone}
          />
        </FieldWrap>
      );

    case "wifi":
      return (
        <div className="space-y-4">
          <FieldWrap label="Network name (SSID)" error={errors.ssid}>
            <TextField
              placeholder="GDG-SRM-Guest"
              value={fields.ssid}
              onChange={(e) => onChange({ ...fields, ssid: e.target.value })}
              error={errors.ssid}
            />
          </FieldWrap>
          <SegmentedControl
            label="Security"
            value={fields.security}
            onChange={(security) => onChange({ ...fields, security })}
            options={[
              { value: "WPA", label: "WPA/WPA2" },
              { value: "WEP", label: "WEP" },
              { value: "nopass", label: "Open" },
            ]}
          />
          {fields.security !== "nopass" && (
            <FieldWrap label="Password" error={errors.password}>
              <TextField
                type="text"
                placeholder="Network password"
                value={fields.password}
                onChange={(e) => onChange({ ...fields, password: e.target.value })}
                error={errors.password}
              />
            </FieldWrap>
          )}
          <Toggle label="Hidden network" checked={fields.hidden} onChange={(hidden) => onChange({ ...fields, hidden })} />
        </div>
      );

    case "vcard":
      return (
        <div className="space-y-4">
          <FieldWrap label="Full name" error={errors.name}>
            <TextField
              placeholder="Ananya Rao"
              value={fields.name}
              onChange={(e) => onChange({ ...fields, name: e.target.value })}
              error={errors.name}
            />
          </FieldWrap>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="Organization">
              <TextField
                placeholder="GDG on Campus SRM"
                value={fields.org}
                onChange={(e) => onChange({ ...fields, org: e.target.value })}
              />
            </FieldWrap>
            <FieldWrap label="Title">
              <TextField
                placeholder="Lead Organizer"
                value={fields.title}
                onChange={(e) => onChange({ ...fields, title: e.target.value })}
              />
            </FieldWrap>
          </div>
          <FieldWrap label="Phone">
            <TextField
              placeholder="+91 90000 00000"
              value={fields.phone}
              onChange={(e) => onChange({ ...fields, phone: e.target.value })}
            />
          </FieldWrap>
          <FieldWrap label="Email" error={errors.email}>
            <TextField
              placeholder="you@domain.com"
              value={fields.email}
              onChange={(e) => onChange({ ...fields, email: e.target.value })}
              error={errors.email}
            />
          </FieldWrap>
          <FieldWrap label="Website">
            <TextField
              placeholder="https://..."
              value={fields.url}
              onChange={(e) => onChange({ ...fields, url: e.target.value })}
            />
          </FieldWrap>
        </div>
      );

    case "sms":
      return (
        <div className="space-y-4">
          <FieldWrap label="Phone number" error={errors.phone}>
            <TextField
              placeholder="+1 555 010 2020"
              value={fields.phone}
              onChange={(e) => onChange({ ...fields, phone: e.target.value })}
              error={errors.phone}
            />
          </FieldWrap>
          <FieldWrap label="Message (optional)">
            <TextAreaField
              rows={3}
              placeholder="Pre-filled text message"
              value={fields.message}
              onChange={(e) => onChange({ ...fields, message: e.target.value })}
            />
          </FieldWrap>
        </div>
      );
  }
}
