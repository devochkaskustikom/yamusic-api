// AUTO-GENERATED FROM spec/ym-api.yaml BY packages/codegen.
// Manual edits are overwritten by `pnpm codegen`. Edit the spec instead.

import type { ShapeNode } from "../schema/types.js";

export const shapes: Readonly<Record<string, ShapeNode>> = {
  "InvocationInfo": {
    "kind": "object",
    "required": [],
    "fields": {
      "req-id": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "hostname": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "Account": {
    "kind": "object",
    "required": [
      "uid"
    ],
    "fields": {
      "now": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "uid": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "login": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "fullName": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "firstName": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "secondName": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "displayName": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "serviceAvailable": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "hostedUser": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      }
    }
  },
  "Plus": {
    "kind": "object",
    "required": [],
    "fields": {
      "hasPlus": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "isTutorialCompleted": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "migrationCompleted": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      }
    }
  },
  "AccountStatusResult": {
    "kind": "object",
    "required": [
      "account"
    ],
    "fields": {
      "account": {
        "kind": "ref",
        "name": "Account"
      },
      "defaultEmail": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "plus": {
        "kind": "ref",
        "name": "Plus"
      }
    }
  },
  "AccountStatusResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "ref",
        "name": "AccountStatusResult"
      }
    }
  },
  "ArtistCover": {
    "kind": "object",
    "required": [],
    "fields": {
      "type": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "uri": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "ArtistCounts": {
    "kind": "object",
    "required": [],
    "fields": {
      "tracks": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "directAlbums": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "alsoAlbums": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "alsoTracks": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      }
    }
  },
  "ArtistRatings": {
    "kind": "object",
    "required": [],
    "fields": {
      "month": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "week": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "day": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      }
    }
  },
  "ArtistLink": {
    "kind": "object",
    "required": [],
    "fields": {
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "url": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "href": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "Artist": {
    "kind": "object",
    "required": [
      "id"
    ],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "name": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "composer": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "various": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "cover": {
        "kind": "ref",
        "name": "ArtistCover"
      },
      "genres": {
        "kind": "array",
        "items": {
          "kind": "primitive",
          "types": [
            "string"
          ]
        }
      },
      "counts": {
        "kind": "ref",
        "name": "ArtistCounts"
      },
      "ratings": {
        "kind": "ref",
        "name": "ArtistRatings"
      },
      "links": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "ArtistLink"
        }
      },
      "noPicturesFromSearch": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      }
    }
  },
  "AlbumShort": {
    "kind": "object",
    "required": [
      "id"
    ],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "year": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "releaseDate": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "coverUri": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "genre": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "metaType": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      }
    }
  },
  "TrackShort": {
    "kind": "object",
    "required": [
      "id"
    ],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "realId": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "version": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "type": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "coverUri": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "artists": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Artist"
        }
      },
      "albums": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "AlbumShort"
        }
      }
    }
  },
  "Track": {
    "kind": "object",
    "required": [
      "id"
    ],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "realId": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "version": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "type": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "coverUri": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "durationMs": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "explicit": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "lyricsAvailable": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "shortDescription": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "fileSize": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "regions": {
        "kind": "array",
        "items": {
          "kind": "primitive",
          "types": [
            "string"
          ]
        }
      },
      "artists": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Artist"
        }
      },
      "albums": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "AlbumShort"
        }
      }
    }
  },
  "Label": {
    "kind": "object",
    "required": [],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "name": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "website": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "Album": {
    "kind": "object",
    "required": [
      "id"
    ],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "version": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "coverUri": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "trackCount": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "genre": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "year": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "releaseDate": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "metaType": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "availableForPremiumUsers": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "availablePartially": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "artists": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Artist"
        }
      },
      "labels": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Label"
        }
      },
      "volumes": {
        "kind": "array",
        "items": {
          "kind": "array",
          "items": {
            "kind": "primitive",
            "types": [
              "number"
            ]
          }
        }
      },
      "tracks": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Track"
        }
      }
    }
  },
  "Owner": {
    "kind": "object",
    "required": [
      "uid"
    ],
    "fields": {
      "uid": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "login": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "name": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "verified": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      }
    }
  },
  "PlaylistCover": {
    "kind": "object",
    "required": [],
    "fields": {
      "type": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "uri": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "PlaylistShort": {
    "kind": "object",
    "required": [
      "kind"
    ],
    "fields": {
      "owner": {
        "kind": "ref",
        "name": "Owner"
      },
      "uid": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "kind": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "description": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "trackCount": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "visibility": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "collective": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "created": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "modified": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "durationMs": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "cover": {
        "kind": "ref",
        "name": "PlaylistCover"
      },
      "ogImage": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "tags": {
        "kind": "array",
        "items": {
          "kind": "primitive",
          "types": [
            "string"
          ]
        }
      },
      "snapshot": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      }
    }
  },
  "Playlist": {
    "kind": "object",
    "required": [
      "kind"
    ],
    "fields": {
      "owner": {
        "kind": "ref",
        "name": "Owner"
      },
      "uid": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "kind": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "description": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "trackCount": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "visibility": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "collective": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "created": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "modified": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "available": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "durationMs": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "cover": {
        "kind": "ref",
        "name": "PlaylistCover"
      },
      "ogImage": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "tags": {
        "kind": "array",
        "items": {
          "kind": "primitive",
          "types": [
            "string"
          ]
        }
      },
      "snapshot": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "tracks": {
        "kind": "array",
        "items": {
          "kind": "union",
          "variants": [
            {
              "kind": "ref",
              "name": "Track"
            },
            {
              "kind": "primitive",
              "types": [
                "null"
              ]
            }
          ]
        }
      }
    }
  },
  "SearchTracksBlock": {
    "kind": "object",
    "required": [],
    "fields": {
      "total": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "perPage": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "order": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "results": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "TrackShort"
        }
      }
    }
  },
  "SearchArtistsBlock": {
    "kind": "object",
    "required": [],
    "fields": {
      "total": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "perPage": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "order": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "results": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Artist"
        }
      }
    }
  },
  "SearchAlbumsBlock": {
    "kind": "object",
    "required": [],
    "fields": {
      "total": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "perPage": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "order": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "results": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Album"
        }
      }
    }
  },
  "SearchPlaylistsBlock": {
    "kind": "object",
    "required": [],
    "fields": {
      "total": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "perPage": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "order": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "results": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Playlist"
        }
      }
    }
  },
  "SearchBest": {
    "kind": "object",
    "required": [],
    "fields": {
      "type": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "text": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "SearchResult": {
    "kind": "object",
    "required": [],
    "fields": {
      "best": {
        "kind": "ref",
        "name": "SearchBest"
      },
      "tracks": {
        "kind": "ref",
        "name": "SearchTracksBlock"
      },
      "artists": {
        "kind": "ref",
        "name": "SearchArtistsBlock"
      },
      "albums": {
        "kind": "ref",
        "name": "SearchAlbumsBlock"
      },
      "playlists": {
        "kind": "ref",
        "name": "SearchPlaylistsBlock"
      }
    }
  },
  "SearchResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "ref",
        "name": "SearchResult"
      }
    }
  },
  "SuggestItem": {
    "kind": "object",
    "required": [],
    "fields": {
      "title": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "url": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "type": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "SuggestResponse": {
    "kind": "object",
    "required": [],
    "fields": {
      "result": {
        "kind": "object",
        "required": [],
        "fields": {
          "suggestions": {
            "kind": "array",
            "items": {
              "kind": "ref",
              "name": "SuggestItem"
            }
          }
        }
      }
    }
  },
  "Lyrics": {
    "kind": "object",
    "required": [],
    "fields": {
      "id": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "lyrics": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "hasRights": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      },
      "textColor": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      },
      "background": {
        "kind": "primitive",
        "types": [
          "string"
        ]
      }
    }
  },
  "LyricsResponse": {
    "kind": "object",
    "required": [],
    "fields": {
      "result": {
        "kind": "union",
        "variants": [
          {
            "kind": "ref",
            "name": "Lyrics"
          },
          {
            "kind": "primitive",
            "types": [
              "null"
            ]
          }
        ]
      }
    }
  },
  "SimilarTracks": {
    "kind": "object",
    "required": [],
    "fields": {
      "track": {
        "kind": "ref",
        "name": "Track"
      },
      "similarTracks": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Track"
        }
      }
    }
  },
  "SimilarTracksResponse": {
    "kind": "object",
    "required": [],
    "fields": {
      "result": {
        "kind": "ref",
        "name": "SimilarTracks"
      }
    }
  },
  "TracksResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "Track"
        }
      }
    }
  },
  "AlbumResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "ref",
        "name": "Album"
      }
    }
  },
  "ArtistResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "ref",
        "name": "Artist"
      }
    }
  },
  "ArtistTracksResult": {
    "kind": "object",
    "required": [],
    "fields": {
      "tracks": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "TrackShort"
        }
      }
    }
  },
  "ArtistTracksResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "ref",
        "name": "ArtistTracksResult"
      }
    }
  },
  "PlaylistsResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "PlaylistShort"
        }
      }
    }
  },
  "PlaylistResponse": {
    "kind": "object",
    "required": [
      "result"
    ],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "ref",
        "name": "Playlist"
      }
    }
  },
  "Library": {
    "kind": "object",
    "required": [],
    "fields": {
      "uid": {
        "kind": "primitive",
        "types": [
          "number"
        ]
      },
      "tracks": {
        "kind": "array",
        "items": {
          "kind": "ref",
          "name": "TrackShort"
        }
      }
    }
  },
  "LikesTracksResponse": {
    "kind": "object",
    "required": [],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "object",
        "required": [],
        "fields": {
          "library": {
            "kind": "ref",
            "name": "Library"
          }
        }
      }
    }
  },
  "MutationResponse": {
    "kind": "object",
    "required": [],
    "fields": {
      "invocationInfo": {
        "kind": "ref",
        "name": "InvocationInfo"
      },
      "result": {
        "kind": "primitive",
        "types": [
          "boolean"
        ]
      }
    }
  }
};
