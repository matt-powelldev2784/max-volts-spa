import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  ChevronsUpDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/ui/table';
import { Button, LinkButton } from '@/ui/button';
import ErrorCard from '@/lib/errorCard';
import { useRef, useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/ui/dropdown-menu';
import DownloadQuoteMenuItem from '../pdfQuote/pdfQuote';
import { useNavigate } from 'react-router';
import CreateInvoice from './components/createInvoice';

const quoteStatusStyle: Record<string, string> = {
  new: 'bg-blue-500 text-white',
  quoted: 'bg-orange-500 text-white',
  accepted: 'bg-mv-green text-white',
  rejected: 'bg-destructive text-white',
  invoiced: 'bg-green-700 text-white',
};

type SortField = 'id' | 'created_at';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const getQuotes = async (sortBy: SortField, sortOrder: SortOrder, page: number, searchTerm: string) => {
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  const clientIdsForSearch: number[] = [];

  let query = supabase
    .from('quote')
    .select('*, client(name, company)', { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' });

  // apply filter to search by client name if searchTerm is provided
  if (searchTerm) {
    clientIdsForSearch.length = 0;

    const clientQueryResult = await supabase.from('client').select('id').ilike('name', `%${searchTerm}%`);

    if (clientQueryResult.error) {
      throw new Error(clientQueryResult.error.message);
    }

    clientQueryResult.data?.forEach((client) => clientIdsForSearch.push(client.id));

    query = query.in('client_id', clientIdsForSearch);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { quotes: data, totalCount: count ?? 0 };
};

const ViewQuotes = () => {
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTermRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quotes', sortBy, sortOrder, page, searchTerm],
    queryFn: () => getQuotes(sortBy, sortOrder, page, searchTerm),
  });

  const quotes = data?.quotes;
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorCard message={error?.message || 'An unknown error occurred.'} />;

  return (
    <section className="w-11/12 mx-auto flexCol">
      {/* Pagination and search */}
      <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-end px-0 md:px-2 mb-4 gap-2 md:gap-8 mt-4 md:mt-4">
        <div className="flexRow gap-4 mb-4 md:mb-0">
          <h1 className="text-2xl text-gray-800">Quote List</h1>
          <Button
            onClick={() => setSearchTerm('')}
            type="submit"
            variant="blank"
            size="sm"
            className="text-sm h-[34px]"
          >
            <RotateCcw className="text-mv-orange p-0 size-5" />
          </Button>
        </div>

        <div className="flex flex-col-reverse md:flex-col justify-end items-center gap-4 md:gap-10 w-full md:w-auto mb-2 md:mb-0">
          <form
            className="relative flexRow w-full md:w-auto gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchTermRef.current?.value || '');
            }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name..."
              ref={searchTermRef}
              className="w-full md:w-64 pl-10 pr-4 py-1 h-[36px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mv-orange focus:border-transparent"
            />

            <Button type="submit" variant="default" size="sm" className="text-sm h-[34px]">
              <Search />
            </Button>
          </form>

          <div className="flex flex-row-reverse md:flex-row justify-between gap-8 w-full">
            <div className="flex gap-4">
              <Button
                variant={page > 0 ? 'iconGhost' : 'iconPrimary'}
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <p className="text-sm text-gray-600 hidden md:flex md:flex-row md:items-center">
                Page {page + 1} of {totalPages}
              </p>

              <Button
                variant={page < totalPages - 1 ? 'iconGhost' : 'iconPrimary'}
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <LinkButton to="/add-quote" variant="default" size="sm" className="text-sm h-[34px]">
              Add Quote
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <Table className="table md:hidden table-fixed">
        <TableHeader>
          <TableRow className="bg-neutral-100">
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-14">Quote</TableHead>
            <TableHead className="w-1/2">Client</TableHead>
            <TableHead className="w-24 pr-4">Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {quotes?.map((quote) => (
            <TableRow key={quote.id} data-testid="quote-product-row" className="hover:bg-muted transition">
              <TableCell>
                <DropDownMenu quoteId={quote.id} clientId={quote.client_id} invoiceId={quote.invoice_id} />
              </TableCell>

              <TableCell className="truncate">{quote.id}</TableCell>
              <TableCell className="truncate">{quote.client?.name}</TableCell>
              <TableCell className="pr-4 truncate">£{quote.total_value?.toFixed(2) ?? '0.00'}</TableCell>
            </TableRow>
          ))}

          {quotes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 h-12">
                {searchTerm ? 'No quotes found matching your search.' : 'No quotes found.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Desktop view */}
      <Table className="hidden md:table table-fixed">
        <TableHeader>
          <TableRow className="bg-neutral-100">
            <TableHead className="w-16"></TableHead>
            <TableHead className="w-28">
              <button onClick={() => handleSort('id')} className="flex items-center">
                Quote
                <ChevronsUpDown className="w-4 h-4 ml-2" />
                {sortBy === 'id' && <ArrowUpDown className="text-mv-orange w-4 h-4 ml-2" />}
              </button>
            </TableHead>

            <TableHead>
              <button className="flex items-center">Client</button>
            </TableHead>
            <TableHead>Company</TableHead>

            <TableHead>
              <button className="flex items-center">Status</button>
            </TableHead>

            <TableHead>
              <button className="flex items-center">Total</button>
            </TableHead>
            <TableHead>
              <button onClick={() => handleSort('created_at')} className="flex items-center">
                Created
                <ChevronsUpDown className="w-4 h-4 ml-2" />
                {sortBy === 'created_at' && <ArrowUpDown className="text-mv-orange w-4 h-4 ml-2" />}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {quotes?.map((quote) => (
            <TableRow key={quote.id} data-testid="quote-product-row" className="hover:bg-muted transition">
              <TableCell className="w-16">
                <DropDownMenu quoteId={quote.id} clientId={quote.client_id} invoiceId={quote.invoice_id} />
              </TableCell>

              <TableCell className="truncate">{quote.id}</TableCell>

              <TableCell className="truncate" title={quote.client?.name || ''}>
                {quote.client?.name}
              </TableCell>

              <TableCell className="truncate" title={quote.client?.company || ''}>
                {quote.client?.company}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${quoteStatusStyle[quote.status] || 'bg-gray-200 text-gray-800'}`}
                >
                  {quote.status?.toUpperCase()}
                </span>
              </TableCell>

              <TableCell className="truncate">£{quote.total_value?.toFixed(2) ?? '0.00'}</TableCell>

              <TableCell className="truncate">
                {quote.created_at ? new Date(quote.created_at).toLocaleDateString('en-GB') : ''}
              </TableCell>
            </TableRow>
          ))}

          {quotes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 h-12">
                {searchTerm ? 'No quotes found matching your search.' : 'No quotes found.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
};

type DropDownMenuProps = {
  quoteId: number;
  clientId: number;
  invoiceId: number | null;
};

const DropDownMenu = ({ quoteId, clientId, invoiceId }: DropDownMenuProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full" aria-label="Quote Actions" data-testid="edit-quote-action-button">
          <ArrowRight strokeWidth={3} className="bg-mv-orange rounded text-white p-1" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="center" className="p-1 min-w-[120px]">
        <div className="flex flex-col">
          <DropdownMenuItem
            data-testid="edit-quote-button"
            className="flex items-center gap-5 px-4 py-2"
            onClick={() => navigate(`/edit/quote?quoteId=${quoteId}&clientId=${clientId}`)}
          >
            <Pencil className="size-6 text-mv-orange" />
            <span className="text-xl mr-2">Edit Quote</span>
          </DropdownMenuItem>

          <DownloadQuoteMenuItem quoteId={quoteId} />

          <DropdownMenuSeparator />

          <CreateInvoice quoteId={quoteId} invoiceId={invoiceId} clientId={clientId} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ViewQuotes;
