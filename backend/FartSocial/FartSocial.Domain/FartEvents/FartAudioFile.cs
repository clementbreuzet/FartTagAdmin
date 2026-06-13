using FartSocial.Domain.Common;

namespace FartSocial.Domain.FartEvents;

public sealed class FartAudioFile : Entity
{
    public Guid UserId { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int DurationMs { get; set; }
    public string? PublicUrl { get; set; }
    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;

    public FartEvent? FartEvent { get; set; }
}
