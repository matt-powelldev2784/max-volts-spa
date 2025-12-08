import { Document, Page, Text, View, StyleSheet, Font, Image, usePDF } from '@react-pdf/renderer';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import type { Client, Quote, QuoteProduct } from '@/types/dbTypes';
import { format } from 'date-fns';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const getQuoteWithProducts = async (quoteId: number) => {
  const { data: quote, error: quoteError } = await supabase.from('quote').select('*').eq('id', quoteId).single();
  if (quoteError) throw new Error(quoteError.message);

  const { data: quoteProducts, error: productsError } = await supabase
    .from('quote_product')
    .select('*')
    .eq('quote_id', quoteId);
  if (productsError) throw new Error(productsError.message);

  const { data: client, error: clientError } = await supabase
    .from('client')
    .select('*')
    .eq('id', quote.client_id)
    .single();
  if (clientError) throw new Error(clientError.message);

  return { quote, quoteProducts, client };
};

type DownloadQuoteMenuItemProps = {
  quoteId: number;
};

const DownloadQuoteMenuItem = ({ quoteId }: DownloadQuoteMenuItemProps) => {
  const {
    data: quoteData,
    refetch,
    isLoading: isQuoteDataLoading,
    isError: isQuoteDataError,
  } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => getQuoteWithProducts(quoteId),
    enabled: false,
  });

  const [quotePDF, updateQuotePDF] = usePDF({ document: undefined });

  // pass quote data to the usePDF hook when user clicks Generate PDF
  useEffect(() => {
    if (quoteData) {
      updateQuotePDF(<PdfLayout quoteData={quoteData} />);
    }
  }, [quoteData, updateQuotePDF]);

  if (isQuoteDataError) {
    return (
      <div className="flex items-center gap-5 px-4 py-2 w-full bg-red-500 rounded">
        <AlertCircle className="size-6 text-white" />
        <span className="text-xl mr-2 text-white">Error generating PDF</span>
      </div>
    );
  }

  if (isQuoteDataLoading || quotePDF.loading) {
    return (
      <div className="flex items-center gap-5 px-4 py-2 w-full">
        <Loader2 className="size-6 text-mv-orange animate-spin" />
        <span className="text-xl mr-2">Generating PDF...</span>
      </div>
    );
  }

  // when PDF is ready, provide download link
  // the user will need to click Download PDF after the PDF is generated
  if (quotePDF.blob) {
    const blobUrl = URL.createObjectURL(quotePDF.blob);
    return (
      <a
        href={blobUrl}
        download={`quote_${quoteId}.pdf`}
        className="flex items-center gap-5 px-4 py-2 w-full hover:bg-gray-100 rounded"
      >
        <Download className="size-6 text-green-500" />
        <span className="text-xl text-green-500 mr-2">Download PDF</span>
      </a>
    );
  }

  return (
    <button className="flex items-center gap-5 px-4 py-2 hover:bg-gray-100 rounded w-full" onClick={() => refetch()}>
      <Download className="size-6 text-mv-orange" />
      <span className="text-xl mr-2">Generate PDF</span>
    </button>
  );
};

Font.register({
  family: 'BrandonBold',
  src: '/Brandon_bld.otf',
});

Font.register({
  family: 'BrandonReg',
  src: '/Brandon_reg.otf',
});

const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    fontFamily: 'BrandonReg',
    fontSize: '12px',
  },
  logoSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  imageContainer: {
    width: 200,
    height: 40,
    marginRight: 16,
    marginBottom: 8,
  },
  textBold: {
    fontFamily: 'BrandonBold',
    fontSize: '14px',
  },
  flexCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  flexCol: {
    flexDirection: 'column',
    width: '100%',
  },
  flexRow: {
    flexDirection: 'row',
    justifyItems: 'space-between',
    marginLeft: 8,
    marginRight: 8,
    width: '90%',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginRight: 8,
    width: '80%',
  },
  totalSection: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 8,
    marginRight: 8,
    width: '90%',
  },
  totalText: {
    flexDirection: 'column',
    textAlign: 'right',
    fontFamily: 'BrandonBold',
    backgroundColor: '#f07e19',
    color: 'white',
    padding: 6,
    paddingHorizontal: 10,
    paddingLeft: 12,
    paddingTop: 9,
  },
  totalNum: {
    flexDirection: 'column',
    textAlign: 'right',
    fontFamily: 'BrandonBold',
    padding: 6,
    paddingTop: 9,
    paddingLeft: 10,
    border: '2px solid black',
  },
  termsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  termsText: {
    flexDirection: 'column',
    textAlign: 'center',
    fontFamily: 'BrandonReg',
    padding: 6,
    paddingTop: 9,
    color: 'grey',
    fontSize: '8px',
    width: '90%',
  },
});

type PdfLayoutProps = {
  quoteData: {
    quote: Quote;
    quoteProducts: QuoteProduct[];
    client: Client;
  };
};

export const PdfLayout = ({ quoteData }: PdfLayoutProps) => {
  const { quote, quoteProducts, client } = quoteData;
  const createdAt = quote.created_at ? new Date(quote.created_at) : new Date();

  const QuoteRowsJsx = quoteProducts.map((quoteProduct, index) => {
    return <QuoteRow key={quoteProduct.id} quoteProduct={quoteProduct} index={index} />;
  });

  return (
    <Document pageLayout="singlePage">
      <Page size="A4" style={pdfStyles.page}>
        <View style={{ height: 16 }}></View>
        <View style={pdfStyles.logoSection}>
          <View style={pdfStyles.imageContainer}>
            <Image src="/max_volts_logo.png" style={{ width: 200, height: 36 }} />
          </View>

          <View style={{ height: 8 }}></View>

          <View style={pdfStyles.flexCenter}>
            <Text style={pdfStyles.textBold}>Quote</Text>
            <View style={{ height: 8 }}></View>

            <View style={pdfStyles.invoiceDetails}>
              <View>
                <Text>{client.name}</Text>
                <Text>{client.company}</Text>
                <Text>{client.address1}</Text>
                <Text>{client.address2}</Text>
                <Text>{client.county}</Text>
                <Text>{client.post_code}</Text>
              </View>

              <View style={pdfStyles.logoSection}>
                <Text>Quote Number: {quote.id}</Text>
                <Text>Date: {format(createdAt, 'd MMMM yyyy')}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 32 }}></View>

          <View style={pdfStyles.flexCenter}>
            <QuoteRowHeader />
            {QuoteRowsJsx}
          </View>

          <View style={{ height: 8 }}></View>

          <View style={pdfStyles.totalSection}>
            <View style={pdfStyles.totalContainer}>
              <Text style={pdfStyles.totalText}>Total Amount:</Text>
              <Text style={pdfStyles.totalNum}>£ {quote.total_value.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ height: 32 }}></View>

          <View style={pdfStyles.flexCenter}>
            <Text>72 Ardrossan Gardens, Worcester Park, Surrey, KT4 7AX</Text>
            <Text>Tel: 07877 695 996</Text>
            <Text>Email: MaxVoltsElectricalServices@gmail.com</Text>
          </View>

          <View style={{ height: 4 }}></View>

          <View style={pdfStyles.termsContainer}>
            <Text style={pdfStyles.termsText}>
              All work is guaranteed for one year from the invoice date. The NAPIT guarantee applies to all domestic and
              commercial work for up to six years. All materials are covered solely by the manufacturers warranties and
              guarantees. Any replacements will incur charges. For any issues or complaints, please provide detailed
              information via email to MaxVoltsElectricalServices@gmail.com.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const quoteRowStyles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
    justifyItems: 'space-between',
    marginLeft: 8,
    marginRight: 8,
    width: '90%',
    fontSize: '10px',
    backgroundColor: '#f07e19',
    color: 'white',
    paddingVertical: 2,
  },
});

export const QuoteRowHeader = () => {
  return (
    <View style={quoteRowStyles.flexRow}>
      <Text style={{ width: 50, height: 'auto', paddingLeft: 4 }}>Quantity</Text>
      <Text style={{ width: 130, height: 'auto' }}>Name</Text>
      <Text style={{ width: 200, height: 'auto' }}>Description</Text>
      <Text style={{ width: 70, height: 'auto' }}>Each</Text>
      <Text style={{ width: 35, height: 'auto' }}>VAT</Text>
      <Text
        style={{
          width: 70,
          height: 'auto',
          textAlign: 'right',
          paddingRight: 4,
        }}
      >
        Total Price
      </Text>
    </View>
  );
};

const quoteRowHeaderStyles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
    justifyItems: 'space-between',
    marginLeft: 8,
    marginRight: 8,
    width: '90%',
    fontSize: '11px',
    padding: 0,
  },
});

type QuoteRowProps = {
  quoteProduct: QuoteProduct;
  index: number;
};

export const QuoteRow = ({ quoteProduct, index }: QuoteRowProps) => {
  const { quantity, name, description, vat_rate, total_value } = quoteProduct;
  const priceForEach = quoteProduct.value;
  const backgroundColor = index % 2 === 0 ? '#ffffff' : '#dedede';

  return (
    <View style={quoteRowHeaderStyles.flexRow} wrap={false}>
      <Text
        style={{
          width: 50,
          height: 'auto',
          paddingVertical: 4,
          paddingLeft: 4,
          backgroundColor: `${backgroundColor}`,
        }}
      >
        {quantity}
      </Text>
      <Text
        style={{
          width: 130,
          height: 'auto',
          paddingVertical: 4,
          paddingRight: 4,
          backgroundColor: `${backgroundColor}`,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          width: 200,
          height: 'auto',
          paddingVertical: 4,
          paddingRight: 4,
          backgroundColor: `${backgroundColor}`,
        }}
      >
        {description}
      </Text>
      <Text
        style={{
          width: 70,
          height: 'auto',
          paddingVertical: 4,
          paddingRight: 4,
          backgroundColor: `${backgroundColor}`,
        }}
      >
        £{priceForEach.toFixed(2)}
      </Text>
      <Text
        style={{
          width: 35,
          height: 'auto',
          paddingVertical: 4,
          paddingRight: 4,
          backgroundColor: `${backgroundColor}`,
        }}
      >
        {vat_rate}%
      </Text>
      <Text
        style={{
          width: 70,
          height: 'auto',
          paddingVertical: 4,
          backgroundColor: `${backgroundColor}`,
          textAlign: 'right',
          paddingRight: 4,
        }}
      >
        £{total_value.toFixed(2)}
      </Text>
    </View>
  );
};

export default DownloadQuoteMenuItem;
