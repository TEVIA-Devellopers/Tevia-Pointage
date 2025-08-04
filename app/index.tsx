import { Redirect } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { data: { session } } = supabase.auth.getSession();
  
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return <Redirect href="/(tabs)" />;
}
