/**
 * Support Service
 * Handles customer support tickets and chat
 */

import { supabase } from './supabase';

export interface CreateTicketParams {
  subject: string;
  message: string;
  category?: 'general' | 'order' | 'payment' | 'delivery' | 'technical';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  order_id?: string;
}

/**
 * Create a support ticket
 */
export const createSupportTicket = async (params: CreateTicketParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: params.subject,
        message: params.message,
        category: params.category || 'general',
        priority: params.priority || 'medium',
        order_id: params.order_id || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    throw new Error(error.message || 'Failed to create support ticket');
  }
};

/**
 * Get user's support tickets
 */
export const getMySupportTickets = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        order:orders(id, status, total),
        messages:support_messages(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting support tickets:', error);
    return [];
  }
};

/**
 * Get ticket details with messages
 */
export const getTicketDetails = async (ticketId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket not found');
    }

    const { data: messages, error: messagesError } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error getting messages:', messagesError);
    }

    return {
      ...ticket,
      messages: messages || [],
    };
  } catch (error: any) {
    console.error('Error getting ticket details:', error);
    throw new Error(error.message || 'Failed to get ticket details');
  }
};

/**
 * Send a message to a support ticket
 */
export const sendSupportMessage = async (ticketId: string, message: string, attachments?: string[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Verify ticket ownership
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id, status')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (!ticket) {
      throw new Error('Ticket not found or access denied');
    }

    // Update ticket status if it was closed
    if (ticket.status === 'closed') {
      await supabase
        .from('support_tickets')
        .update({ status: 'open' })
        .eq('id', ticketId);
    }

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_type: 'user',
        message,
        attachments: attachments || [],
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending support message:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};

/**
 * Subscribe to ticket messages (real-time)
 */
export const subscribeToTicketMessages = (ticketId: string, callback: (message: any) => void) => {
  const channel = supabase
    .channel(`ticket_${ticketId}_messages`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Mark ticket messages as read
 */
export const markMessagesAsRead = async (ticketId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('support_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('ticket_id', ticketId)
      .eq('sender_type', 'support')
      .is('is_read', false);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

