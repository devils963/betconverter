"use client";

import axios from "axios";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CopyIcon,
  LoaderIcon,
  MessagesSquareIcon,
  PlusIcon
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { env } from "~/env";
import { cn } from "~/lib/utils";

interface IBookie {
  name: string;
  country: string;
  countryShortCode: string;
  inputDisabled: boolean;
  outputDisabled: boolean;
}

interface ApiErrorResponse {
  error: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

// Type guard for API error response
function isApiErrorResponse(error: unknown): error is { response?: { data?: ApiErrorResponse } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default function HomePage() {
  const [data, setData] = useState({
    code: "",
    input: {
      name: "",
      country: "",
      countryShortCode: "",
      inputDisabled: false,
      outputDisabled: false,
    },
    output: {
      name: "",
      country: "",
      countryShortCode: "",
      inputDisabled: false,
      outputDisabled: false,
    },
    remove: false,
  });

  const [resData, setResData] = useState<{
    shareCode: string;
    shareURL: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [forceRemove, setForceRemove] = useState(false);
  const [bookiesList, setBookiesList] = useState<IBookie[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchBookies = async () => {
      try {
        const res = await axios.get<ApiResponse<IBookie[]>>(env.NEXT_PUBLIC_API_URL + "/bookies");
        if (res.data.message === "success") {
          setBookiesList(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch bookies:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    if (isMounted) {
      void fetchBookies();
    }
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  const hanleSubmit = async () => {
    try {
      setIsLoading(true);
      if (
        data.input.name === data.output.name &&
        data.input.country === data.output.country
      ) {
        return toast.error("You can't convert to the same bookie");
      }
      if (data.code.length < 1) {
        return toast.error("kindly input the booking code");
      }
      if (
        data.input.countryShortCode.length < 1 ||
        data.output.countryShortCode.length < 1
      ) {
        return toast.error("kindly select code source");
      }
      if (data.input.name === "stake") {
        toast(
          `Note: This may take a bit longer and a few games may not be converted because they are not available on ${data.output.name}`,
        );
      }

      const res = await axios.post<ApiResponse<{
        shareCode: string;
        shareURL: string;
      }>>(env.NEXT_PUBLIC_API_URL, {
        ...data,
      });

      if (res.data.message !== "success") {
        return toast.error(res.data.message);
      }
      setResData(res.data.data);
      setForceRemove(false);
    } catch (error: unknown) {
      // console.log(error);
      console.log(data)
      if (isApiErrorResponse(error)) {
        const errorMessage = error.response?.data?.error;
        if (errorMessage?.startsWith("Unsupported bet")) {
          return toast.error(errorMessage);
        }
        if (errorMessage?.startsWith("Some markets are not available:")) {
          return toast.error(errorMessage);
        }
        if (errorMessage?.startsWith("invalid event data, no market there")) {
          return toast.error(
            errorMessage +
            ": consider converting to msport first because it displays the exact games not available and ability to remove them, then convert from msport to your desired bookie"
          );
        }
        return toast.error(errorMessage ?? "Something went wrong");
      }
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const hanleSubmitWithRemove = async () => {
    try {
      setIsLoading(true);
      if (
        data.input.name === data.output.name &&
        data.input.country === data.output.country
      ) {
        return toast.error("You can't convert to the same bookie");
      }
      if (data.code.length < 1) {
        return toast.error("kindly input the booking code");
      }
      if (
        data.input.countryShortCode.length < 1 ||
        data.output.countryShortCode.length < 1
      ) {
        return toast.error("kindly select code source");
      }
      if (data.input.name === "stake") {
        toast(
          `Note: This may take a bit longer and a few games may not be converted because they are not available on ${data.output.name}`,
        );
      }

      const res = await axios.post<ApiResponse<{
        shareCode: string;
        shareURL: string;
      }>>(env.NEXT_PUBLIC_API_URL, {
        ...data,
      });

      if (res.data.message !== "success") {
        return toast.error(res.data.message);
      }
      setResData(res.data.data);
      setForceRemove(false);
    } catch (error: unknown) {
      // console.log(error);
      if (isApiErrorResponse(error)) {
        const errorMessage = error.response?.data?.error;
        if (errorMessage?.startsWith("Unsupported bet")) {
          return toast.error(errorMessage);
        }
        if (errorMessage?.startsWith("Some markets are not available:")) {
          return toast.error(errorMessage);
        }
        if (errorMessage?.startsWith("invalid event data, no market there")) {
          return toast.error(
            errorMessage +
            ": consider converting to msport first because it displays the exact games not available and ability to remove them, then convert from msport to your desired bookie"
          );
        }
        return toast.error(errorMessage ?? "Something went wrong");
      }
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-[hsl(280,100%,70%)]/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6 text-[hsl(280,100%,70%)] animate-pulse" />
            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(280,100%,60%)] bg-clip-text text-transparent">
              BetConverter
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(280,100%,60%)] px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
              href="https://api.whatsapp.com/send/?phone=2348028573902&text=from+your+website+betconverter.xyz&app_absent=0"
            >
              Request
              <PlusIcon className="h-4 w-4" />
            </Link>
            <Link
              className="rounded-full p-2 transition-all hover:scale-105 hover:bg-accent"
              target="_blank"
              href="https://github.com/sacsbrainz/betconverter"
              aria-label="Star sacsbrainz/betconverter on GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M11.999 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-24">
        <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-card/50 p-8 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Heyy I'm <span className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(280,100%,60%)] bg-clip-text text-transparent">vibe coding</span>👋
            </h1>
            <p className="mt-2 text-muted-foreground">
              Convert your betting codes between different platforms instantly
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Booking Code</label>
              <input
                onChange={(e) => {
                  setData((prev) => ({ ...prev, code: e.target.value }));
                }}
                value={data.code}
                className="w-full rounded-lg border-2 bg-background/50 px-4 py-2 transition-all focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]/20"
                type="text"
                placeholder="Paste your booking code here..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Popover open={inputOpen} onOpenChange={setInputOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between capitalize transition-all hover:border-[hsl(280,100%,70%)]"
                    >
                      {data.input.name
                        ? `${data.input.name} ${data.input.country.toLowerCase() === "global"
                          ? ""
                          : data.input.country
                        }`
                        : "Select Source..."}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search bookie..." />
                      <CommandList>
                        <CommandEmpty>No bookie found.</CommandEmpty>
                        <CommandGroup>
                          {bookiesList?.map((bookie, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => {
                                setData((prev) => ({
                                  ...prev,
                                  input: {
                                    ...bookie,
                                    inputDisabled: false,
                                    outputDisabled: false,
                                  },
                                }));
                                setInputOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.input.name === bookie.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {bookie.name}{" "}
                              {bookie.country.toLowerCase() === "global"
                                ? ""
                                : bookie.country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Popover open={outputOpen} onOpenChange={setOutputOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between capitalize transition-all hover:border-[hsl(280,100%,70%)]"
                    >
                      {data.output.name
                        ? `${data.output.name} ${data.output.country.toLowerCase() === "global"
                          ? ""
                          : data.output.country
                        }`
                        : "Select Source..."}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search bookie..." />
                      <CommandList>
                        <CommandEmpty>No bookie found.</CommandEmpty>
                        <CommandGroup>
                          {bookiesList?.map((bookie, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => {
                                setData((prev) => ({
                                  ...prev,
                                  output: {
                                    ...bookie,
                                    inputDisabled: false,
                                    outputDisabled: false,
                                  },
                                }));
                                setOutputOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.output.name === bookie.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {bookie.name}{" "}
                              {bookie.country.toLowerCase() === "global"
                                ? ""
                                : bookie.country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {resData && (
              <div className="rounded-lg border bg-card/50 p-4 shadow-lg transition-all hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {data.output.name}-{data.output.countryShortCode}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{resData.shareCode}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="transition-all hover:scale-110"
                    onClick={() => {
                      if (!navigator.clipboard) return;
                      if (data.output.name.toLowerCase() === "msport") {
                        void navigator.clipboard
                          .writeText(
                            `https://www.msport.com/${data.output.countryShortCode}?code=${resData.shareCode}`,
                          )
                          .then(() => {
                            toast.success("Copied to clipboard");
                          });
                        return;
                      }
                      void navigator.clipboard
                        .writeText(resData.shareURL)
                        .then(() => {
                          toast.success("Copied to clipboard");
                        });
                    }}
                  >
                    <CopyIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                disabled={isLoading}
                onClick={forceRemove ? hanleSubmitWithRemove : hanleSubmit}
                className="w-full max-w-xs rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(280,100%,60%)] text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRightIcon className="mr-2 h-4 w-4" />
                )}
                {forceRemove ? "Force Convert" : "Convert"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-sm text-muted-foreground">
            Made with <span className="text-[hsl(280,100%,70%)]">❤️</span> by{" "}
            <Link
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-[hsl(280,100%,70%)] hover:underline"
              href="https://api.whatsapp.com/send/?phone=2348028573902&text=from+your+website+betconverter.xyz&app_absent=0"
            >
              sascbrainz
            </Link>
          </div>
          <Link
            rel="noopener noreferrer"
            target="_blank"
            className="rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(280,100%,60%)] p-2 text-white transition-all hover:scale-105 hover:shadow-lg"
            href="https://api.whatsapp.com/send/?phone=2348028573902&text=from+your+website+betconverter.xyz&app_absent=0"
          >
            <MessagesSquareIcon className="h-5 w-5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
