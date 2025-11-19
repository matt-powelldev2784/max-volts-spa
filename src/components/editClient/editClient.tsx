import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button, LinkButton } from '@/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';
import { Input } from '@/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import LoadingSpinner from '@/ui/LoadingSpinner';
import FormError from '@/lib/formError';
import { ArrowLeft, EllipsisVertical, Loader2, Trash, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ClientInsert } from '@/types/dbTypes';
import ErrorCard from '@/lib/errorCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  company: z.string().optional(),
  email: z.email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  telephone: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  post_code: z.string().optional(),
});

const getClientById = async (clientId: number) => {
  const { data, error } = await supabase.from('client').select('*').eq('id', clientId).single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteClient = async (clientId: number) => {
  const { data, error } = await supabase.from('client').delete().eq('id', clientId);
  if (error) throw new Error('Server Error. Client deletion failed. Please try again later.');
  return data;
};

type UpdateClientProps = {
  clientId: number;
  updateData: ClientInsert;
};

const updateClient = async ({ clientId, updateData }: UpdateClientProps) => {
  const { error } = await supabase.from('client').update(updateData).eq('id', clientId);
  if (error) throw new Error(error.message);
};

type EditClientProps = {
  clientId: number;
};

const EditClient = ({ clientId }: EditClientProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientById(clientId),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      telephone: '',
      address1: '',
      address2: '',
      city: '',
      county: '',
      post_code: '',
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        telephone: client.telephone || '',
        address1: client.address1 || '',
        address2: client.address2 || '',
        city: client.city || '',
        county: client.county || '',
        post_code: client.post_code || '',
      });
    }
  }, [client, form]);

  const mutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/view-clients');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({ clientId, updateData: values });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorCard message={'Failed to load client.'} />;
  if (!clientId) return <ErrorCard message="No client ID provided." />;

  return (
    <section className="flex min-h-screen items-start justify-center bg-none md:bg-gray-50 md:p-4 pb-24 md:pb-24">
      <div className="w-full flexCol md:max-w-[600px]">
        {/* Title */}
        <div className="flexRow gap-4 mt-4 mb-6 md:bg-transparent w-full">
          <div className="rounded-full bg-mv-orange w-10 h-10 flexCol">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-center text-2xl">Edit Client</CardTitle>
        </div>

        <Card className="border-0 md:border-2 border-transparent md:border-gray-200 shadow-none md:shadow-lg w-full rounded-none md:rounded-3xl -translate-y-6 md:-translate-y-0">
          <CardHeader className="rounded-t-xl">
            <CardDescription className="text-center">
              Update the client details below and click save to apply changes.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-4">
                  {/* Repeat all fields as in AddClient */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telephone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Telephone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Address Line 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Address Line 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County</FormLabel>
                        <FormControl>
                          <Input placeholder="County" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="post_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Post Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Message */}
                {mutation.isError && <FormError message={mutation.error.message} />}

                {/* Buttons */}
                <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
                  <DeleteClientDropDown clientId={clientId} />

                  <LinkButton variant="ghost" size="formButton" to="/view-clients" className="hide-xs">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </LinkButton>

                  <Button type="submit" size="formButton" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="text-white" /> : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

type DeleteClientDropDownProps = {
  clientId: number;
};

const DeleteClientDropDown = ({ clientId }: DeleteClientDropDownProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="w-full flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Delete client actions">
              <EllipsisVertical className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="center" className="p-1 min-w-[90px]">
            <div className="flex flex-col">
              <DropdownMenuItem className="flex items-center gap-5 px-4 py-2" onClick={handleOpenModal}>
                <Trash className="size-6 text-mv-orange" />
                <p className="text-xl mr-2">Delete Client</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDeleteClientModal isOpen={isModalOpen} clientId={clientId} handleCloseModal={handleCloseModal} />
    </>
  );
};

type ConfirmDeleteClientModalProps = {
  isOpen: boolean;
  clientId: number;
  handleCloseModal: () => void;
};

const ConfirmDeleteClientModal = ({ isOpen, clientId, handleCloseModal }: ConfirmDeleteClientModalProps) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => deleteClient(clientId),
    onSuccess: () => {
      navigate('/view-clients');
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleCloseModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-none rounded-2xl overflow-y-auto w-11/12 md:w-auto">
        <DialogHeader className="flexCol">
          <Trash className="h-6 w-6 md:h-8 md:w-8 text-mv-orange" />
          <DialogTitle>Delete Client</DialogTitle>
        </DialogHeader>

        <p className="py-4 text-center">Are you sure you want to delete this client? This action cannot be undone.</p>

        {mutation.isError && <FormError message={mutation.error.message} />}

        <div className="relative w-full flex flex-row justify-end gap-2 px-1 md:px-0 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="formButton"
            onClick={handleCloseModal}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="formButton"
            onClick={handleDelete}
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClient;