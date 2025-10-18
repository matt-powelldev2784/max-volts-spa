import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ChevronsUpDown, ArrowUpDown, ChevronLeft, ChevronRight, Search, RotateCcw } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/ui/table';
import { Button, LinkButton } from '@/ui/button';
import ErrorCard from '@/lib/errorCard';
import { Link } from 'react-router';
import { useRef, useState } from 'react';
import type { Tables } from '@/types/database.types';
import LoadingSpinner from '@/ui/LoadingSpinner';

type Client = Tables<'client'>;

type SortField = 'name' | 'company' | 'email';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const getClients = async (sortBy: SortField, sortOrder: SortOrder, page: number, searchTerm: string) => {
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('client')
    .select('*', { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' });

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { clients: data as Client[], totalCount: count ?? 0 };
};

const ViewClients = () => {
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTermRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['clients', sortBy, sortOrder, page, searchTerm],
    queryFn: () => getClients(sortBy, sortOrder, page, searchTerm),
  });

  const clients = data?.clients;
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
    <div className="w-11/12 mx-auto flexCol">
      {/* Pagination and search */}
      <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-end px-0 md:px-2 mb-4 gap-2 md:gap-8 mt-4 md:mt-4">
        <div className="flexRow gap-4  mb-4 md:mb-0">
          <p className="text-2xl text-gray-800 ">Client List</p>
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
              placeholder="Search by name..."
              ref={searchTermRef}
              className="w-full md:w-64 pl-10 pr-4 py-1 h-[36px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mv-orange focus:border-transparent"
            />

            <Button type="submit" variant="default" size="sm" className="text-sm h-[34px]">
              <Search />
            </Button>
          </form>

          <div className="flex flex-row-reverse md:flex-row justify-between gap-8 w-full">
            <div className="flex gap-4 ">
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

            <LinkButton to="/add-client" variant="default" size="sm" className="text-sm h-[34px]">
              Add Client
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <Table className="table md:hidden table-fixed">
        <TableHeader>
          <TableRow className="bg-neutral-100">
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-1/2">Name</TableHead>
            <TableHead className="w-1/2 pr-4">Company</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clients?.map((client) => (
            <TableRow key={client.id} className="hover:bg-muted transition">
              <TableCell>
                <Link to={`/client/${client.id}`} className="flexCol">
                  <div className="w-[25px] h-[25px] bg-mv-orange rounded">
                    <ArrowRight strokeWidth={3} className="text-white p-1" />
                  </div>
                </Link>
              </TableCell>
              <TableCell className="truncate">{client.name}</TableCell>
              <TableCell className="pr-4 truncate">{client.company}</TableCell>
            </TableRow>
          ))}

          {clients?.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 h-12">
                {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
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

            <TableHead className="w-1/4">
              <button onClick={() => handleSort('name')} className="flex items-center">
                Name
                <ChevronsUpDown className="w-4 h-4 ml-2" />
                {sortBy === 'name' && <ArrowUpDown className="text-mv-orange w-4 h-4 ml-2" />}
              </button>
            </TableHead>

            <TableHead className="w-1/4">
              <button onClick={() => handleSort('company')} className="flex items-center">
                Company
                <ChevronsUpDown className="w-4 h-4 ml-2" />
                {sortBy === 'company' && <ArrowUpDown className="text-mv-orange w-4 h-4 ml-2" />}
              </button>
            </TableHead>

            <TableHead className="w-1/4">
              <button onClick={() => handleSort('email')} className="flex items-center">
                Email
                <ChevronsUpDown className="w-4 h-4 ml-2" />
                {sortBy === 'email' && <ArrowUpDown className="text-mv-orange w-4 h-4 ml-2" />}
              </button>
            </TableHead>

            <TableHead className="w-1/4">Telephone</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clients?.map((client) => (
            <TableRow key={client.id} className="hover:bg-muted transition">
              <TableCell className="w-16">
                <Link to={`/client/${client.id}`} className="flexCol">
                  <div className="w-[25px] h-[25px] bg-mv-orange rounded">
                    <ArrowRight strokeWidth={3} className="text-white p-1" />
                  </div>
                </Link>
              </TableCell>
              <TableCell className="truncate" title={client.name || ''}>
                {client.name}
              </TableCell>
              <TableCell className="truncate" title={client.company || ''}>
                {client.company}
              </TableCell>
              <TableCell className="truncate" title={client.email || ''}>
                {client.email}
              </TableCell>
              <TableCell className="truncate" title={client.telephone || ''}>
                {client.telephone}
              </TableCell>
            </TableRow>
          ))}

          {clients?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 h-12">
                {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ViewClients;
