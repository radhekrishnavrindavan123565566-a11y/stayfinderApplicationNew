import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface AgreementData {
  agreementId: string;
  tenantName: string;
  ownerName: string;
  propertyTitle: string;
  propertyAddress: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  tenantSignature?: string;
  ownerSignature?: string;
}

export function generateAgreementText(data: AgreementData): string {
  return `RESIDENTIAL RENTAL AGREEMENT
Agreement ID: ${data.agreementId}
Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

PARTIES
-------
Owner:  ${data.ownerName}
Tenant: ${data.tenantName}

PROPERTY
--------
Title:   ${data.propertyTitle}
Address: ${data.propertyAddress}

TERMS
-----
Monthly Rent: ₹${data.monthlyRent.toLocaleString()}
Lease Start:  ${data.startDate}
Lease End:    ${data.endDate}

TERMS AND CONDITIONS
--------------------
1. PAYMENT — Rent is due on the 1st of each month. A grace period of 5 days applies.
   Late payments attract a penalty of 2% per week.

2. SECURITY DEPOSIT — A refundable security deposit equal to two months' rent is payable
   before move-in. It will be returned within 30 days of vacating, subject to deductions
   for damages beyond normal wear and tear.

3. UTILITIES — Electricity, water, and internet charges are the tenant's responsibility
   unless otherwise agreed in writing.

4. MAINTENANCE — The tenant shall keep the premises clean and in good condition.
   The owner is responsible for structural repairs. The tenant must report any damage
   within 48 hours of discovery.

5. SUBLETTING — The tenant may not sublet or assign the premises without prior written
   consent from the owner.

6. TERMINATION — Either party may terminate this agreement with 30 days' written notice.
   Early termination by the tenant forfeits the security deposit.

7. ENTRY — The owner may enter the premises with 24 hours' notice for inspections,
   repairs, or showings, except in emergencies.

8. GOVERNING LAW — This agreement is governed by the laws of India and any disputes
   shall be resolved in the jurisdiction of the property's location.

SIGNATURES
----------
Owner:  ${data.ownerSignature || "(pending)"}
Tenant: ${data.tenantSignature || "(pending)"}

By signing, both parties agree to the terms and conditions stated above.
`;
}

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 10, color: "#666", textAlign: "center", marginBottom: 20 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 3 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 120, fontFamily: "Helvetica-Bold", fontSize: 10 },
  value: { flex: 1, fontSize: 10 },
  clause: { marginBottom: 6, lineHeight: 1.5 },
  clauseNum: { fontFamily: "Helvetica-Bold" },
  sigBox: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 4, padding: 10, minHeight: 50, marginTop: 4 },
  sigName: { fontFamily: "Helvetica-BoldOblique", fontSize: 14, color: "#1d4ed8" },
  sigPending: { color: "#9ca3af", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, textAlign: "center", fontSize: 8, color: "#9ca3af" },
});

export function AgreementPDF({ data }: { data: AgreementData }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.title }, "RESIDENTIAL RENTAL AGREEMENT"),
      React.createElement(Text, { style: styles.subtitle }, `Agreement ID: ${data.agreementId}`),

      // Parties
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "PARTIES"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Owner:"),
          React.createElement(Text, { style: styles.value }, data.ownerName)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Tenant:"),
          React.createElement(Text, { style: styles.value }, data.tenantName)
        )
      ),

      // Property
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "PROPERTY"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Title:"),
          React.createElement(Text, { style: styles.value }, data.propertyTitle)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Address:"),
          React.createElement(Text, { style: styles.value }, data.propertyAddress)
        )
      ),

      // Terms
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "LEASE TERMS"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Monthly Rent:"),
          React.createElement(Text, { style: styles.value }, `\u20B9${data.monthlyRent.toLocaleString()}`)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Start Date:"),
          React.createElement(Text, { style: styles.value }, data.startDate)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "End Date:"),
          React.createElement(Text, { style: styles.value }, data.endDate)
        )
      ),

      // Conditions
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "TERMS AND CONDITIONS"),
        ...[
          ["1. PAYMENT", "Rent is due on the 1st of each month. A grace period of 5 days applies. Late payments attract a penalty of 2% per week."],
          ["2. SECURITY DEPOSIT", "A refundable security deposit equal to two months' rent is payable before move-in, returned within 30 days of vacating."],
          ["3. UTILITIES", "Electricity, water, and internet charges are the tenant's responsibility unless otherwise agreed in writing."],
          ["4. MAINTENANCE", "The tenant shall keep the premises clean. The owner is responsible for structural repairs."],
          ["5. SUBLETTING", "The tenant may not sublet or assign the premises without prior written consent from the owner."],
          ["6. TERMINATION", "Either party may terminate with 30 days' written notice. Early termination by the tenant forfeits the security deposit."],
          ["7. GOVERNING LAW", "This agreement is governed by the laws of India."],
        ].map(([num, text]) =>
          React.createElement(
            View,
            { style: styles.clause, key: num },
            React.createElement(Text, null,
              React.createElement(Text, { style: styles.clauseNum }, `${num}: `),
              text
            )
          )
        )
      ),

      // Signatures
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "SIGNATURES"),
        React.createElement(View, { style: styles.row },
          React.createElement(
            View,
            { style: { flex: 1, marginRight: 8 } },
            React.createElement(Text, { style: { fontSize: 10, marginBottom: 4 } }, "Owner"),
            React.createElement(
              View,
              { style: styles.sigBox },
              data.ownerSignature
                ? React.createElement(Text, { style: styles.sigName }, data.ownerSignature)
                : React.createElement(Text, { style: styles.sigPending }, "Pending signature")
            )
          ),
          React.createElement(
            View,
            { style: { flex: 1, marginLeft: 8 } },
            React.createElement(Text, { style: { fontSize: 10, marginBottom: 4 } }, "Tenant"),
            React.createElement(
              View,
              { style: styles.sigBox },
              data.tenantSignature
                ? React.createElement(Text, { style: styles.sigName }, data.tenantSignature)
                : React.createElement(Text, { style: styles.sigPending }, "Pending signature")
            )
          )
        )
      ),

      React.createElement(Text, { style: styles.footer }, "This is a legally binding document. Generated by RoomRental Platform.")
    )
  );
}
