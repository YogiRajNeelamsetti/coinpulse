'use client'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { CreditCardIcon, SearchIcon, SettingsIcon, TrendingDown, TrendingUp, UserIcon, Flame, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useDebounce, useKey } from 'react-use';
import Image from "next/image";
import { cn, formatPercentage } from "@/lib/utils";
import useSWR from "swr";
import { useRouter } from "next/navigation";

const searchFetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search');
    return res.json();
};



const TRENDING_LIMIT = 7;
const SEARCH_LIMIT = 10;

const SearchItem = ({ coin, onSelect, isActiveName }: SearchItemProps) => {
    const isSearchCoin = typeof coin.data?.price_change_percentage_24h === 'number';
    const change = isSearchCoin ? (coin as SearchCoin).data?.price_change_percentage_24h ?? 0 : (coin as TrendingCoin['item']).data.price_change_percentage_24h?.usd ?? 0;

    return (
        <CommandItem
            value={coin.name}
            onSelect={() => onSelect(coin.id)}
            className="search-item"
        >
            <div className="coin-info">
                <Image src={coin.thumb} alt={coin.name} width={40} height={40} />
                <div>
                    <p className={cn('font-bold', isActiveName && 'text-white')}>
                        {coin.name}
                    </p>
                    <p className="coin-symbol">{coin.symbol}</p>
                </div>
            </div>
            
            <div className={cn('coin-change', change >= 0 ? 'text-green-500' : 'text-red-500')}>
                {change >= 0 ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                <span>{formatPercentage(Math.abs(change))}</span>
            </div>
        </CommandItem>
    )
}


const SearchModal = ({ initialTrendingCoins = [] }: { initialTrendingCoins: TrendingCoin[] }) => {

    const router = useRouter();
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ debouncedSearchQuery, setDebouncedSearchQuery ] = useState('');
    const [ isDebouncing, setIsDebouncing ] = useState(false);

    const [open, setOpen] = useState(false);
    // cmd + k | ctrl + k to open search
    useKey(
        (event) => (event.key === 'k' && (event.metaKey || event.ctrlKey)), 
        (event) => {
            event.preventDefault();
            setOpen((open) => !open);
        },
        {},
        [setOpen]
    );

    useDebounce(() => {
        setDebouncedSearchQuery(searchQuery.trim());
        setIsDebouncing(false);
    }, 300, [searchQuery]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setIsDebouncing(true);
    };

    const { data: searchResults = [], isValidating: isSearching } = useSWR<SearchCoin[]>(
        debouncedSearchQuery ? `/api/search?query=${encodeURIComponent(debouncedSearchQuery)}` : null, 
        searchFetcher, 
        { revalidateOnFocus: false }
    );

    const handleSelect = (coinId: string) => {
        setOpen(false);
        setSearchQuery('');
        setDebouncedSearchQuery('');
        router.push(`/coins/${coinId}`);
    };

    const hasQuery = debouncedSearchQuery.length > 0;
    const isTyping = searchQuery.trim().length > 0;
    const trendingCoins = initialTrendingCoins.slice(0, TRENDING_LIMIT);
    const showTrending = !isTyping && trendingCoins.length > 0;

    // Show loading when debouncing OR when fetching
    const isLoading = isDebouncing || isSearching;

    const isSearchEmpty = !isTyping && !showTrending;
    const isTrendingListVisible = showTrending;

    const isNoResults = !isLoading && hasQuery && searchResults.length === 0;
    const isResultsVisible = !isLoading && hasQuery && searchResults.length > 0;

  return (
    <div className="search-modal" id="search-modal">
        <Button onClick={() => setOpen(true)} variant="ghost" className="trigger">
            <SearchIcon size={16}/>
            <span className="hidden sm:inline">Search coins...</span>
            <kbd className="kbd">
                <span className="text-xs">⌘</span>K
            </kbd>
        </Button>
        <CommandDialog open={open} 
            onOpenChange={setOpen}
            className="dialog"
            data-search-modal
        >
            <div className="cmd-input">
                <CommandInput 
                    placeholder="Search for a token by name or symbol..."
                    value={searchQuery}
                    onValueChange={handleSearchChange}
                />
            </div>
                
            <CommandList className="list custom-scrollbar">
                {isLoading && isTyping && (
                    <div className="empty">
                        <Loader2 className="size-5 animate-spin text-purple-100/60" />
                        <span>Searching...</span>
                    </div>
                )}
                {isSearchEmpty && (
                    <div className="empty">
                        <SearchIcon className="size-5 text-purple-100/40" />
                        <span>Start typing to search for coins</span>
                    </div>
                )}

                {isTrendingListVisible && (
                    <CommandGroup heading={<span className="heading"><Flame className="size-4 text-yellow-500" /> Trending</span>}>
                        {trendingCoins.map(({item}) => (
                            <SearchItem 
                                key={item.id} 
                                coin={item} 
                                onSelect={handleSelect} 
                                isActiveName={false}
                            />
                        ))}
                    </CommandGroup>
                )}

                {isNoResults && (
                    <div className="empty">
                        <SearchIcon className="size-5 text-purple-100/40" />
                        <span>No results found for "{debouncedSearchQuery}"</span>
                    </div>
                )}

                {isResultsVisible && (
                    <CommandGroup heading={<span className="heading"><SearchIcon className="size-3.5" /> Results</span>}>
                        {searchResults.slice(0, SEARCH_LIMIT).map((coin) => (       
                            <SearchItem 
                                key={coin.id} 
                                coin={coin}
                                onSelect={handleSelect}
                                isActiveName
                            />
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    </div>
  )
}

export default SearchModal