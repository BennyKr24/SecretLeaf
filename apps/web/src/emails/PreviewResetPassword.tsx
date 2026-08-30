// Dev-Preview für den `react-email`-Server. Locale hier auf "en" stellen, um
// die englische Variante zu sehen.
import * as React from "react";
import { ActionEmail } from "./ActionEmail";

export default function PreviewResetPassword() {
  return (
    <ActionEmail
      templateKey="resetPassword"
      locale="de"
      actionUrl="https://secretleaf.net/auth/v1/verify?token=preview-token-hash&type=signup&redirect_to=https%3A%2F%2Fsecretleaf.net%2Fde"
      recipientEmail="name@example.com"
    />
  );
}
