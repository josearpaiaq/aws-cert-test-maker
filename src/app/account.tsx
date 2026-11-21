import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isApiConfigured } from '@/api/client';
import { accountErrorMessage } from '@/api/error-message';
import { useAccount } from '@/state/account';

type Mode = 'login' | 'register';

const inputClass =
  'min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50';

function PrimaryButton(props: { label: string; busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: props.busy, disabled: props.busy }}
      disabled={props.busy}
      onPress={props.onPress}
      className="min-h-14 items-center justify-center rounded-2xl bg-sky-700 px-8 py-3 active:bg-sky-800"
    >
      {props.busy ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text maxFontSizeMultiplier={1.5} className="text-lg font-semibold text-white">
          {props.label}
        </Text>
      )}
    </Pressable>
  );
}

function SignInForm() {
  const signIn = useAccount((s) => s.signIn);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(mode, { email: email.trim(), password });
    } catch (e) {
      setError(accountErrorMessage(e, mode));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-5">
      <View
        accessibilityRole="tablist"
        className="flex-row rounded-xl bg-slate-200 p-1 dark:bg-slate-800"
      >
        {(['login', 'register'] as const).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === m }}
            onPress={() => {
              setMode(m);
              setError(null);
            }}
            className={`min-h-11 flex-1 items-center justify-center rounded-lg ${
              mode === m ? 'bg-white dark:bg-slate-950' : ''
            }`}
          >
            <Text className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {m === 'login' ? 'Sign in' : 'Create account'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Text>
        <TextInput
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          returnKeyType="next"
          editable={!busy}
          className={inputClass}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Text>
        <TextInput
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          textContentType={mode === 'login' ? 'password' : 'newPassword'}
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
          editable={!busy}
          className={inputClass}
        />
        {mode === 'register' && (
          <Text className="text-sm text-slate-500 dark:text-slate-400">At least 8 characters.</Text>
        )}
      </View>

      {error && (
        <Text
          accessibilityLiveRegion="polite"
          className="text-base text-rose-700 dark:text-rose-400"
        >
          {error}
        </Text>
      )}

      <PrimaryButton
        label={mode === 'login' ? 'Sign in' : 'Create account'}
        busy={busy}
        onPress={() => void submit()}
      />
    </View>
  );
}

function SignedIn() {
  const user = useAccount((s) => s.user);
  const signOut = useAccount((s) => s.signOut);
  const deleteAccount = useAccount((s) => s.deleteAccount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your CloudPrep account and everything stored with it. Progress on this device is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBusy(true);
            setError(null);
            deleteAccount()
              .catch((e: unknown) => setError(accountErrorMessage(e, 'login')))
              .finally(() => setBusy(false));
          },
        },
      ],
    );
  };

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-sm text-slate-500 dark:text-slate-400">Signed in as</Text>
        <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {user?.email ?? 'Your account'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void signOut()}
        className="min-h-12 items-center justify-center rounded-xl bg-slate-200 py-2 active:opacity-70 dark:bg-slate-800"
      >
        <Text className="text-base font-semibold text-slate-900 dark:text-slate-50">Sign out</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={confirmDelete}
        className="min-h-12 items-center justify-center rounded-xl border-2 border-rose-500 py-2 active:opacity-70 dark:border-rose-400"
      >
        <Text className="text-base font-semibold text-rose-700 dark:text-rose-400">
          Delete account
        </Text>
      </Pressable>

      {error && (
        <Text
          accessibilityLiveRegion="polite"
          className="text-base text-rose-700 dark:text-rose-400"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export default function AccountScreen() {
  const status = useAccount((s) => s.status);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-6 px-5 pb-8 pt-4"
        >
          <Text className="text-base leading-6 text-slate-600 dark:text-slate-400">
            Connect this device to your CloudPrep account. Studying never needs an account, and your
            progress stays on this device.
          </Text>
          {!isApiConfigured ? (
            <Text className="text-base text-slate-900 dark:text-slate-50">
              Accounts aren&apos;t available in this build.
            </Text>
          ) : status === 'unknown' ? (
            <ActivityIndicator size="large" accessibilityLabel="Loading account" />
          ) : status === 'signed-in' ? (
            <SignedIn />
          ) : (
            <SignInForm />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
