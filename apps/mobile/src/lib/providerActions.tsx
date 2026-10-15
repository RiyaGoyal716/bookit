import { Share } from 'react-native';
import { useRouter } from 'expo-router';

import type { Provider } from '../mocks/types';
import type { ContextMenuAction } from '../components/ui';
import { useFavouritesStore } from '../stores/favouritesStore';
import { useCompareStore, COMPARE_LIMIT } from '../stores/compareStore';
import { showToast } from '../stores/toastStore';

/**
 * Quick actions for a provider card's long-press context menu:
 * favourite / share / compare. Shared by Home, Explore and lists.
 */
export function useProviderCardActions(provider: Provider): ContextMenuAction[] {
  const router = useRouter();
  const isFav = useFavouritesStore((s) => s.ids.includes(provider.id));
  const toggleFav = useFavouritesStore((s) => s.toggle);
  const inCompare = useCompareStore((s) => s.ids.includes(provider.id));
  const toggleCompare = useCompareStore((s) => s.toggle);

  return [
    {
      icon: 'heart',
      label: isFav ? 'Remove favourite' : 'Add to favourites',
      onPress: () => {
        toggleFav(provider.id);
        showToast(isFav ? 'Removed from favourites' : 'Added to favourites');
      },
    },
    {
      icon: 'share',
      label: 'Share',
      onPress: () => {
        Share.share({ message: `Check out ${provider.name} on Bookit` }).catch(() => {});
      },
    },
    {
      icon: 'compare',
      label: inCompare ? 'Remove from compare' : 'Compare',
      onPress: () => {
        const ok = toggleCompare(provider.id);
        if (!ok) {
          showToast(`You can compare up to ${COMPARE_LIMIT} providers`);
        } else {
          showToast(inCompare ? 'Removed from compare' : 'Added to compare');
          if (!inCompare) router.push('/compare');
        }
      },
    },
  ];
}
