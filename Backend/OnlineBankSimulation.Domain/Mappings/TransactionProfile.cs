using AutoMapper;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.Models;

namespace OnlineBank.Core.Mappings
{
    public class TransactionProfile : Profile
    {
        public TransactionProfile()
        {
            CreateMap<Transaction, TransactionReadDto>()
                .ForMember(dest => dest.ReceiptPath, opt => opt.MapFrom(src => src.ReceiptPath));
            CreateMap<TransactionCreateDto, Transaction>();
        }
    }
}