import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 11, color: "#1a1a1a" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 12, textAlign: "center", color: "#555", marginBottom: 32 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontFamily: "Helvetica-Bold", width: 140 },
  value: { flex: 1, color: "#333" },
  body: { lineHeight: 1.6, color: "#444", marginBottom: 8 },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#333", paddingTop: 8 },
  signatureLabel: { fontSize: 10, color: "#666" },
  signatureValue: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 4 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, textAlign: "center", fontSize: 9, color: "#aaa" },
});

interface AgreementData {
  tenantName: string;
  ownerName: string;
  propertyTitle: string;
  propertyAddress: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  tenantSignature?: string;
  ownerSignature?: string;
  agreementId: string;
}

export function AgreementPDF({ data }: { data: AgreementData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>RENTAL AGREEMENT</Text>
        <Text style={styles.subtitle}>Agreement ID: {data.agreementId}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Landlord (Owner):</Text>
            <Text style={styles.value}>{data.ownerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tenant:</Text>
            <Text style={styles.value}>{data.tenantName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{data.propertyTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{data.propertyAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenancy Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent:</Text>
            <Text style={styles.value}>${data.monthlyRent.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{data.startDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>End Date:</Text>
            <Text style={styles.value}>{data.endDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.body}>
            1. The tenant agrees to pay the monthly rent on or before the 5th of each month.{"\n"}
            2. The tenant shall maintain the property in good condition and report any damages promptly.{"\n"}
            3. Subletting is not permitted without prior written consent from the landlord.{"\n"}
            4. Either party may terminate this agreement with 30 days written notice.{"\n"}
            5. The security deposit equivalent to one month&apos;s rent is held in escrow and refundable upon satisfactory inspection.{"\n"}
            6. Pets are allowed only with prior written approval from the landlord.{"\n"}
            7. The tenant is responsible for utility bills unless otherwise agreed in writing.
          </Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Landlord Signature</Text>
            <Text style={styles.signatureValue}>{data.ownerSignature || "___________________"}</Text>
            <Text style={styles.signatureLabel}>{data.ownerName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Tenant Signature</Text>
            <Text style={styles.signatureValue}>{data.tenantSignature || "___________________"}</Text>
            <Text style={styles.signatureLabel}>{data.tenantName}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This agreement was generated digitally. Both parties have agreed to the terms above.
        </Text>
      </Page>
    </Document>
  );
}

export function generateAgreementText(data: AgreementData): string {
  return `RENTAL AGREEMENT

Agreement ID: ${data.agreementId}

PARTIES:
Landlord: ${data.ownerName}
Tenant: ${data.tenantName}

PROPERTY:
${data.propertyTitle}
${data.propertyAddress}

TERMS:
Monthly Rent: $${data.monthlyRent}
Start Date: ${data.startDate}
End Date: ${data.endDate}

TERMS & CONDITIONS:
1. The tenant agrees to pay the monthly rent on or before the 5th of each month.
2. The tenant shall maintain the property in good condition.
3. Subletting is not permitted without prior written consent.
4. Either party may terminate with 30 days written notice.
5. Security deposit is held in escrow and refundable upon satisfactory inspection.
6. Pets allowed only with prior written approval.
7. Tenant is responsible for utility bills unless otherwise agreed.`;
}
