import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #059669',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  receiptNo: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 11,
    color: '#666',
  },
  value: {
    width: '60%',
    fontSize: 11,
    color: '#000',
    fontWeight: 'bold',
  },
  amountSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginBottom: 5,
  },
  signature: {
    marginTop: 40,
    paddingTop: 10,
    borderTop: '1 solid #000',
    width: '40%',
    fontSize: 10,
    color: '#666',
  },
});

interface RentReceiptProps {
  payment: {
    _id: string;
    booking: {
      property: {
        title: string;
        location?: {
          address: string;
          city: string;
          state: string;
          pincode: string;
        };
      };
      tenant?: {
        username: string;
        email: string;
      };
      owner?: {
        username: string;
        email: string;
      };
    };
    amount: number;
    month: string;
    year: number;
    paidDate?: string;
    transactionId?: string;
    paymentMethod?: string;
  };
}

const RentReceipt: React.FC<RentReceiptProps> = ({ payment }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stayerra</Text>
          <Text style={styles.subtitle}>Rent Payment Receipt</Text>
          <Text style={styles.receiptNo}>Receipt No: {payment._id.slice(-8).toUpperCase()}</Text>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Period:</Text>
            <Text style={styles.value}>{payment.month} {payment.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Date:</Text>
            <Text style={styles.value}>{formatDate(payment.paidDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{payment.paymentMethod?.toUpperCase() || 'UPI'}</Text>
          </View>
          {payment.transactionId && (
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{payment.transactionId}</Text>
            </View>
          )}
        </View>

        {/* Tenant Details */}
        {payment.booking.tenant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tenant Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{payment.booking.tenant.username}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{payment.booking.tenant.email}</Text>
            </View>
          </View>
        )}

        {/* Owner Details */}
        {payment.booking.owner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{payment.booking.owner.username}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{payment.booking.owner.email}</Text>
            </View>
          </View>
        )}

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{payment.booking.property.title}</Text>
          </View>
          {payment.booking.property.location && (
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>
                {payment.booking.property.location.address}, {payment.booking.property.location.city}, {payment.booking.property.location.state} - {payment.booking.property.location.pincode}
              </Text>
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total Amount Paid</Text>
          <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
        </View>

        {/* Signature */}
        <View style={{ marginTop: 60 }}>
          <View style={styles.signature}>
            <Text>Authorized Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer-generated receipt and does not require a physical signature.
          </Text>
          <Text style={styles.footerText}>
            For any queries, please contact support@stayerra.com
          </Text>
          <Text style={styles.footerText}>
            Generated on {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default RentReceipt;
