"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customerSchema } from "@/lib/validations";
import { zodToFieldErrors, type ActionState } from "@/lib/action-state";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerDocuments,
  deleteCustomerDocument,
} from "@/lib/repositories/customers";

function parse(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    birthday: formData.get("birthday"),
    phone_ddd: formData.get("phone_ddd"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    street_number: formData.get("street_number"),
    street_complement: formData.get("street_complement"),
    neighborhood: formData.get("neighborhood"),
    cep: formData.get("cep"),
    city: formData.get("city"),
    state: formData.get("state"),
    referred_by_id: formData.get("referred_by_id"),
    referred_by_name: formData.get("referred_by_name"),
    notes: formData.get("notes"),
  });
}

function documentFiles(formData: FormData): File[] {
  return formData
    .getAll("documents")
    .filter((v): v is File => v instanceof File);
}

export async function createCustomerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  const customer = await createCustomer(parsed.data);
  await addCustomerDocuments(customer.id, documentFiles(formData));
  revalidatePath("/customers");
  redirect(`/customers/${customer.id}?flash=customer_created`);
}

export async function updateCustomerAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) return zodToFieldErrors(parsed.error);

  // A customer cannot refer themselves.
  const data =
    parsed.data.referred_by_id === id
      ? { ...parsed.data, referred_by_id: null }
      : parsed.data;
  await updateCustomer(id, data);
  await addCustomerDocuments(id, documentFiles(formData));
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}?flash=customer_updated`);
}

export async function deleteCustomerAction(id: string): Promise<void> {
  await deleteCustomer(id);
  revalidatePath("/customers");
  redirect("/customers?flash=customer_deleted");
}

export async function deleteCustomerDocumentAction(
  documentId: string,
  customerId: string,
): Promise<void> {
  await deleteCustomerDocument(documentId);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/customers/${customerId}/edit`);
}
