using FartSocial.Domain.Common;

namespace FartSocial.Domain.FartEvents;

public sealed class FartAudioFile : Entity
{
    public Guid UserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int DurationMs { get; set; }
    public byte[]? BlobData { get; set; }
    public string? Sha256 { get; set; }
    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;

    public FartEvent? FartEvent { get; set; }
}
